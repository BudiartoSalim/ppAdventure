////////////////GLOBAL VARIABLES AND REFERENCES DECLARATION////////////////
let player = {};
let normalEnemy = {};
let logSize = 25; //defines the size of adventure log lines
let shop = {};
let playerTurn = true;
let stageCounter = 1;  //defines current stage
let currentRecord = 0;  //defines current record, resets on refresh but not on new game session
let bossStages = 10;  //boss stage appears every x amount of stage (if 5, meaning every stage 5, 10, 15 etc is boss fight)

//references for elements in html for quick access/edit, globally declared due to reuse in multiple functions//
let opponentSection = document.getElementById('opponent-section');
let shopWindow = document.getElementById(`shop-window`);
let shopMessage = document.getElementById(`shop-message`);
let combatButton = document.getElementById(`start-combat`);
let newGameButton = document.getElementById(`new-game`);
let nextStageButton = document.getElementById(`next-stage`);
///////////////////////////////////////////////////////////////////////////

/////////////RESET/RESTART FUNCTION TO SET VARIABLE TO STANDARD STARTING VALUE///////////
function initializePlayer(){
    player.maxHealth= 1000;
    player.currentHealth= 1000;
    player.attack= 200;
    player.money= 500;
    player.ownPotion= true;
    document.getElementById("player-avatar").src = `img/PlayerChara.png`;
}

//FUNCTION BELOW INITIALIZES ENEMY ENCOUNTER INCLUDING BOSS ENCOUNTER//
function initializeEnemy(){ 
    normalEnemy = {
        name: "Banditos",
        currentHealth: 500 + Math.floor(Math.random() * stageCounter * 100),
        attack: 20 + Math.floor(Math.random() * (10 + stageCounter)),
        money: 100 + Math.floor(Math.random() * stageCounter * 100)
    };
    document.getElementById("npc-avatar").src = `img/NormalEnemy.png`;
    if (stageCounter % bossStages === 0){
        normalEnemy.name = "Boss Banditos";
        normalEnemy.currentHealth = normalEnemy.currentHealth + (normalEnemy.currentHealth*(stageCounter/bossStages)) * 2;
        normalEnemy.attack = normalEnemy.attack * 2;
        normalEnemy.money = normalEnemy.money * 3;
        document.getElementById("npc-avatar").src = `img/Boss.png`;
    }
    combatButton.style.display = "block";
    opponentSection.style.display = "block"; //show enemy if enemy exists
}

//FUNCTION BELOW INITIALIZES NEW GAME SESSION. DOES NOT RESET CURRENT BEST RECORD//
function initializeNewGame(){
    stageCounter = 1;
    initializePlayer();
    initializeEnemy();
    shopWindow.style.display = "none";
    shop = {
        potion: 200,
        upgradeAttackItem: {
            price: 500,
            inc: 200
        },
        upgradeDefItem: {
            price: 500,
            inc: 200
        },
        fullHeal: {
            price: 100
        }
    }
    document.getElementById('buy-potion').innerText = `Buy Potion (${shop.potion}g)`;
    document.getElementById('buy-heal').innerText = `Full Heal (${shop.fullHeal.price}g)`;
    printToScreen();
}

function initializePlayerName(){
    do {
        player.name = prompt("Enter your name (1~16 characters): ");
    } while (player.name.length < 1 || player.name.length >= 16)
}
//////THESE FUNCTIONS RUNS UPON PAGE OPEN TO INITIALIZE STUFFS//////
generateLogContainer(); //generating the adventure logs container
initializePlayerName(); //getting player name through prompt
initializeNewGame(); // Initializing new game session
////////////END OF INITIALIZATION/////////////

function damageCalculation(origin, target){
    let atk = origin.attack;
    let damage = atk + Math.floor((atk/2) * Math.random());
    //PRINT `${target} takes ${damage} damage!`;
    target.currentHealth -= damage;
    if (target.currentHealth < 0){
        target.currentHealth = 0;
    }
    updateAdventureLog(`${origin.name} deal ${damage} damage to ${target.name}!`);
}
function generateLogContainer(){ //generating adventure log based on logSize variable
    let logMaster = document.getElementById("log-master");
    for (let i = 0; i < logSize; i++){
        let newSpan = document.createElement('span');
        newSpan.id = `log${i}`;
        logMaster.appendChild(newSpan);
        logMaster.appendChild(document.createElement('br'));
    }
}

function updateAdventureLog(str){
    for (let i = logSize-1; i > 0; i--){
        document.getElementById(`log${i}`).innerText = document.getElementById(`log${i-1}`).innerText;
    }
    document.getElementById("log0").innerText = str;
}

function startCombat(){
    combatButton.style.display = "none";
    let combatMessage = [];
    let messageCounter = 0;
    let currentTarget = normalEnemy; //ASSIGN CURRENT TARGET AS THE ENEMY OF THE CURRENT STAGE
    while (player.currentHealth > 0 && currentTarget.currentHealth > 0){
        if (playerTurn){
            if (player.currentHealth < player.maxHealth/2 && player.ownPotion === true){
                usePotion();
            } else {
                damageCalculation(player, currentTarget);
            }
            playerTurn = false;
            if (currentTarget.currentHealth <= 0){
                player.money += currentTarget.money;
                document.getElementById("npc-avatar").src = `img/NormalEnemyDed.png`;
                if (stageCounter%bossStages === 0){
                    document.getElementById("npc-avatar").src = `img/BossDed.png`;
                }
                updateAdventureLog(`=========================================`);
                updateAdventureLog(`====You defeated the ${currentTarget.name} and get ${currentTarget.money}g!====`);
                updateAdventureLog(`Proceeding to next stage...`);
                stageCounter++;
            }
        } else{
            damageCalculation(currentTarget, player);
            playerTurn = true;
            if (player.currentHealth <= 0){ //IF YOU DED, PRINT MESSAGE!
                if (currentRecord < stageCounter){
                    currentRecord = stageCounter;
                }
                document.getElementById("player-avatar").src = `img/PlayerDed.png`;
                updateAdventureLog(`=========================`);
                updateAdventureLog(`Your current best is ${currentRecord} stages!`);
                updateAdventureLog(`======You got defeated!======`);
            }
        }
        printToScreen();
    }
    nextStage();
} // COMBAT FUNCTION IS HERE
// EXPAND TO SEE

function nextStage(){
    nextStageButton.style.display = 'block';
}


function rollStage(){
    nextStageButton.style.display = "none";
    opponentSection.style.display = "none";
    let diceroll = Math.floor(Math.random() * 100);
    if (stageCounter % bossStages === 0){
        initializeEnemy();
    } else if (diceroll < 70){
        initializeEnemy();
    } else {
        shopStage();
    }
    printToScreen();
}

function shopStage(){
    shopWindow.style.display = "block";
    shopMessage.innerText = `Welcome to my humble shop, adventurer~ \nIf there's anything you need, just say the word.`;
    document.getElementById('npc-avatar').src = 'img/Shopkeeper.png';
    printShopContentUpdate();
}

function buyPotion(){
    if (player.money >= shop.potion && player.ownPotion === false){
        player.money -= shop.potion;
        player.ownPotion = true;
        shopMessage.innerText = `Thank you! Here's your potion~`;
        document.getElementById("carry-potion").src = 'img/Potion.png';
    } else if (player.ownPotion === true){
        shopMessage.innerText = `Sorry but it seems you can't carry more potions...`;
    }
    else {
        notEnoughMoney();
    }
    printShopContentUpdate();
    printToScreen();
}

function notEnoughMoney(){
        shopMessage.innerText = `I am sorry but it seems you do not have enough money...`;
}

function buyWeapon(){
    if(player.money >= shop.upgradeAttackItem.price){
        player.money -= shop.upgradeAttackItem.price;
        player.attack += shop.upgradeAttackItem.inc;
        shop.upgradeAttackItem.price = Math.ceil(shop.upgradeAttackItem.price * 1.5);
        shopMessage.innerText = `Thanks! Hope you like your new weapon!`;
    } else{
        notEnoughMoney();
    }
    printShopContentUpdate();
    printToScreen();
}

function buyArmor(){
    if(player.money >= shop.upgradeDefItem.price){
        player.money -= shop.upgradeDefItem.price;
        player.maxHealth += shop.upgradeDefItem.inc;
        shop.upgradeDefItem.price = Math.ceil(shop.upgradeDefItem.price * 1.5);
        shopMessage.innerText = `Here's your new armor, thank you for the purchase~`;
    } else{
        notEnoughMoney();
    }
    printShopContentUpdate();
    printToScreen();
}

function buyHeal(){
    if(player.money >= shop.fullHeal.price && player.currentHealth < player.maxHealth){
        player.money -= shop.fullHeal.price;
        player.currentHealth = player.maxHealth;
        shopMessage.innerText = `You're fully healed now, take care!`;
    } else {
        notEnoughMoney();
    }
    printShopContentUpdate();
    printToScreen();
}

function stopShopping(){
    shopWindow.style.display="none";
    stageCounter++;
    printToScreen();
    rollStage();
}

function halfHeal(){
    healAmount = Math.round(player.maxHealth/2);
    if (player.currentHealth + healAmount > player.maxHealth){
        healAmount = player.maxHealth - player.currentHealth;
        player.currentHealth = player.maxHealth + healAmount;
    } else {
        player.currentHealth += healAmount;
    }
    return healAmount;
}

function usePotion(){
    let healAmount = halfHeal();
    player.ownPotion = false;
    updateAdventureLog(`You used a potion and recovered ${healAmount}!`);
    document.getElementById("carry-potion").src = '';
}


/////////////////DISPLAY UPDATES FUNCTIONS DOWN HERE////////////////////////////
function printShopContentUpdate(){
    document.getElementById('buy-weapon').innerText = `Upgrade Weapon (${shop.upgradeAttackItem.price}g)`;
    document.getElementById('buy-armor').innerText = `Upgrade Armor (${shop.upgradeDefItem.price}g)`;
    document.getElementById('buy-heal').innerText = `Full Heal (${shop.fullHeal.price}g)`;
}

function printToScreen(){
    document.getElementById('player-name').innerText = player.name;
    document.getElementById('player-hp').innerText = player.currentHealth;
    document.getElementById('player-atk').innerText = player.attack;
    document.getElementById('player-money').innerText = player.money;
    document.getElementById('enemy-name').innerText = normalEnemy.name;
    document.getElementById('enemy-hp').innerText = normalEnemy.currentHealth;
    document.getElementById('enemy-atk').innerText = normalEnemy.attack;
    document.getElementById('enemy-money').innerText = normalEnemy.money;
    document.getElementById('current-stage').innerText = stageCounter;
}
