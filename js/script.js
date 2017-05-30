var me = true;
var chessBoard = [];    //二维数组, 存储棋盘上落子情况, 1 代表已经落黑棋, 2 代表落了白旗, 0 代表空
var over = false;   //表示游戏是否已结束

//赢法数组
var wins = [];
//赢法种类索引, count的所有可能出现次数,即为赢法的总数, 一共572种赢法
var count = 0;
//赢法的统计数组
var myWin = [];
var computerWin = [];

var chess = document.getElementById('chess');
var context = chess.getContext('2d');

/*====================================================
    chessBoard 和 wins 初始化
====================================================*/
for(var i = 0; i < 15; i++){
    chessBoard[i] = [];
    wins[i] = [];
    for(var j = 0; j < 15; j++){
        chessBoard[i][j] = 0;
        wins[i][j] = [];
    }
}

/*====================================================
    穷举所有赢法
====================================================*/
//例如 这是第0种赢法---(0,0)(0,1)(0,2)(0,3)(0,4)四个点炼成一线
// wins[0][0][0] = true
// wins[0][1][0] = true
// wins[0][2][0] = true
// wins[0][3][0] = true
// wins[0][4][0] = true
// 1. 所有竖线的赢法
for(var i = 0; i < 15; i++){
    for(var j = 0; j < 11; j++){
        for(var k = 0; k < 5; k++){
            wins[i][j + k][count] = true;
        }
        count++;
    }
}
// 2. 所有横线的赢法
for(var i = 0; i < 15; i++){
    for(var j = 0; j < 11; j++){
        for(var k = 0; k < 5; k++){
            wins[j + k][i][count] = true;
        }
        count++;
    }
}
// 3. 所有右斜线的赢法
for(var i = 0; i < 11; i++){
    for(var j = 0; j < 11; j++){
        for(var k = 0; k < 5; k++){
            wins[i + k][j + k][count] = true;
        }
        count++;
    }
}
// 4. 所有左斜线的赢法
for(var i = 0; i < 11; i++){
    for(var j = 14; j > 3; j--){
        for(var k = 0; k < 5; k++){
            wins[i + k][j - k][count] = true;
        }
        count++;
    }
}

// console.log(count);//572

/*====================================================
    赢法统计数组初始化
====================================================*/
for(var i = 0; i < count; i++) {
    myWin[i] = 0;
    computerWin[i] = 0;
}
/*====================================================
    初始化棋盘尺寸, 棋子尺寸
====================================================*/
chess.width = window.innerWidth * 0.9;
chess.height = chess.width;
var gridNumInAline = 15;//一行格数
var gridWidth = Math.round(chess.width / gridNumInAline);
var chessWidth = 0.4333 * gridWidth;
/*====================================================
    画棋盘
====================================================*/
context.strokeStyle = '#bfbfbf';
for(var i = 0; i < 15; i++){
    //画竖线
    context.moveTo(gridWidth / 2 + i * gridWidth, gridWidth / 2);
    context.lineTo(gridWidth / 2 + i * gridWidth, chess.width - gridWidth / 2);
    context.stroke();
    //画横线
    context.moveTo(gridWidth / 2, gridWidth / 2 + i * gridWidth);
    context.lineTo(chess.width - gridWidth / 2, gridWidth / 2 + i * gridWidth);
    context.stroke();
}

/*====================================================
    每走一步画一颗棋子, i, j 是坐标. me为布尔值, true代表黑棋
====================================================*/
var oneStep = function(i, j, me) {
    // 根据坐标画棋子
    context.beginPath();
    context.arc(gridWidth / 2 + i * gridWidth, gridWidth / 2 + j * gridWidth, chessWidth, 0, 2 * Math.PI);
    context.closePath();
    //阴影
    var gradient = context.createRadialGradient(gridWidth / 2 + i * gridWidth + 0.0667 * gridWidth, gridWidth / 2 + j * gridWidth - 0.0667 * gridWidth, chessWidth, gridWidth / 2 + i * gridWidth + 0.0667 * gridWidth, gridWidth / 2 + j * gridWidth - 0.0667 * gridWidth, 0);
    if(me){
        //黑棋
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#636766');
    }else{
        //白旗
        gradient.addColorStop(0, '#d1d1d1');
        gradient.addColorStop(1, '#f9f9f9');      
    }
    context.fillStyle = gradient;
    context.fill();    
}

/*====================================================
    鼠标点击事件
====================================================*/
chess.onclick = function(e) {
    if(over) {
        return;
    }
    if(!me) {
        return;
    }
    var x = e.offsetX;
    var y = e.offsetY;
    var i = Math.floor(x / gridWidth);
    var j = Math.floor(y / gridWidth);

    //棋盘为空的时候才能落子
    if(chessBoard[i][j] === 0){
        oneStep(i, j, me);
        chessBoard[i][j] = 1;
        
        // 更新玩家的赢法统计数组
        //遍历赢法统计数组,在(i,j)落子后, 如果第 k 种赢法中也包含(i, j), 那么第 k 种赢法加一, 当第 k 种赢法达到 5 的时候就胜利了
        for(var k = 0; k < count; k++){
            if(wins[i][j][k]) {
                myWin[k] ++;
                computerWin[k] = 6; //玩家在(i, j)落子后, 如果计算机中的第 k 种赢法中也包含(i, j), 那么计算机的第 k 种赢法就不可能实现, 设为 6 
                if(myWin[k] == 5) {
                    setTimeout(function() {
                        if(window.confirm('你赢了，重新开始吗？')){
                            location = '';
                        }
                    }, 0); 
                    over = true;
                }
            }
        }
        if(!over) {
            me = !me;   //黑白交叉落子 
            setTimeout(function() {
                computerAI();//计算机下棋
            }, 500);
        } 
    }
}

// 计算机下棋算法(AI)
var computerAI = function() {
    var myScore = [];   //二维数组, 玩家下一步会在某个空子落棋的可能性
    var computerScore = []; //二维数组, 计算机下一步会在某个空子落棋的可能性
    var max = 0;    //保存最高分数
    var u = 0, v = 0;   //保存最高分数时的坐标
    //初始化
    for(var i = 0; i < 15; i++){
        myScore[i] = [];
        computerScore[i] = [];
        for(var j = 0; j < 15; j++){
            myScore[i][j] = 0;
            computerScore[i][j] = 0;
        }
    }
    // 计算权值, 调整权值可以改变计算机的进攻/防守策略, 
    // 例如把计算机的 computerScore 权值调整的比玩家的大一些, 表现为进攻
    // 把积分低(computerWin)的时候的权值调高一点, 积分高的时候的权值调低一点, 表现更为冒险
    // 这些调节以后再完善, 或者可以判断出玩家的策略后, 让计算机自行调整为最佳策略
    for(var i = 0; i < 15; i++){
        for(var j = 0; j < 15; j++){
            //找出所有空子, 对每一个空子遍历所有赢法, 找出含有该空子的所有赢法
            if(chessBoard[i][j] == 0){
                for(var k = 0; k < count; k++){
                    if(wins[i][j][k]){
                        // 玩家
                        // 如果玩家在某一种赢法上积分为 1, 玩家在当前空子上的权值加200
                        // 如果玩家在某一种赢法上积分为 2, 玩家在当前空子上的权值加400
                        // 如果玩家在某一种赢法上积分为 3, 玩家在当前空子上的权值加2000
                        // 如果玩家在某一种赢法上积分为 4, 玩家在当前空子上的权值加10000
                        //  权值代表了玩家下一步会在该空子上落棋的可能性
                        if(myWin[k] == 1){
                            myScore[i][j] += 200;
                        }else if(myWin[k] == 2){
                            myScore[i][j] += 400;
                        }else if(myWin[k] == 3){
                            myScore[i][j] += 2000;
                        }else if(myWin[k] == 4){
                            myScore[i][j] += 10000;
                        }
                        // 计算机
                        if(computerWin[k] == 1){
                            computerScore[i][j] += 220;
                        }else if(computerWin[k] == 2){
                            computerScore[i][j] += 420;
                        }else if(computerWin[k] == 3){
                            computerScore[i][j] += 2100;
                        }else if(computerWin[k] == 4){
                            computerScore[i][j] += 20000;
                        }
                    }
                }
                //  玩家
                // 把对于玩家权值最高的空子位置付给(u, v), 相应权值赋给 max
                if(myScore[i][j] > max) {
                    max = myScore[i][j];
                    u = i;
                    v = j;
                }else if(myScore[i][j] == max){
                    //如果对于玩家的某颗空子的权值和当前最高权值 max 相等, 那么根据该空子对于计算机的权值权值来判断是否替换最高权值空子位置(u, v)
                    //如果对于计算机(i, j)的权值高于前最高权值位置(u, v), 那么对于玩家来说, (i, j)可以替代前最高权值(u, v)
                    if(computerScore[i][j] > computerScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }
                //  计算机
                // 把对于计算机权值最高的空子位置付给(u, v), 相应权值赋给 max
                if(computerScore[i][j] > max) {
                    max = computerScore[i][j];
                    u = i;
                    v = j;
                }else if(computerScore[i][j] == max){
                    //如果对于计算机的某颗空子的权值和当前最高权值 max 相等, 那么根据该空子对于玩家的权值权值来判断是否替换最高权值空子位置(u, v)
                    //如果对于玩家(i, j)的权值高于前最高权值位置(u, v), 那么对于计算机来说, (i, j)可以替代前最高权值(u, v)
                    if(myScore[i][j] > myScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }
            }
        }
    }
    //计算机落棋
    oneStep(u, v, false)
    chessBoard[u][v] = 2;

    // 更新计算机的赢法统计数组
    //遍历赢法统计数组,在(i,j)落子后, 如果第 k 种赢法中也包含(i, j), 那么第 k 种赢法加一, 当第 k 种赢法达到 5 的时候就胜利了
    for(var k = 0; k < count; k++){
        if(wins[u][v][k]) {
            computerWin[k] ++;
            myWin[k] = 6; //计算机在(i, j)落子后, 如果玩家中的第 k 种赢法中也包含(i, j), 那么计算机的第 k 种赢法就不可能实现, 设为 6 
            if(computerWin[k] == 5) {
                setTimeout(function() {
                    if(window.confirm('你输了，重新开始吗？')){
                        location = '';
                    } 
                }, 0); 
                over = true;
            }
        }
    }
    if(!over) {
        me = !me;   //黑白交叉落子
    }
}



