class BossScene extends Phaser.Scene{
  constructor(){
    super("bossScene");
  }

  init()
  {
    this.enemySpeed = 2;
    this.enemyMaxY = 490; //280
    this.enemyMinY = 105;  //80
    this.enemyMaxX = 790; //280
    this.enemyMinX = 10;  //80
    this.bossSpeed = 2;
    this.bossHP = 100;
    this.bossMinX = 6630; //-250 for offscreen leftside //1030
    this.bossAlive = true;
    this.startBoss = false;
    this.numEnemiesLeft = 2;
    this.enemyKilled = false;
    this.text = "";
    this.timer;
    this.ability1;
    this.ability2;
    this.ability3;
    this.playerbullets;
  }

  preload()
  {
    // load images
    this.load.image('background1', 'assets/cyberpunk-street3.png');
    this.load.image('background2', 'assets/cyberpunk-street.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('dragon', 'assets/dragon.png');
    this.load.image('treasure', 'assets/treasure.png');


    //this.load.image('ninja', 'assets/blockninja2.png');
    this.load.image('ninja', 'assets/blockninja.png');
    //this.load.image('ninja', 'assets/blockninjaold.png');
    //this.load.image('ninja', 'assets/blockninjaold2.png');
    this.load.image('star', 'assets/ninjastar3.png');
    this.load.image('starbig', 'assets/ninjastar.png');
    this.load.image('boss', 'assets/boss.png');
    //this.load.image('boss', 'assets/bossnew.png');

    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('laser', 'assets/laser.png');

    this.load.setPath('assets');
    this.load.audio('ability1', [ 'fireball1.mp3' ]);
    this.load.audio('ability2', [ 'laser.mp3' ]);
    this.load.audio('ability3', [ 'stomp.mp3' ]);
    this.load.audio('dinogrowl', [ 'dinogrowl.mp3' ]);
    this.load.audio('throwstar', [ 'throwstar.mp3' ]);
    this.load.audio('teleport', [ 'teleport.mp3' ]);
    this.load.audio('throwtriplestar', [ 'throwtriplestar2.mp3' ]);
    this.load.audio('throwbigstar', [ 'throwbigstar.mp3' ]);
  }

  create()
  {
    //audio
    this.ability1 = this.sound.add('ability1', {volume: 0.5});
    this.ability2 = this.sound.add('ability2', {volume: 0.5});
    this.ability3 = this.sound.add('ability3');
    this.dinogrowl = this.sound.add('dinogrowl');
    this.throwstar = this.sound.add('throwstar');
    this.teleport = this.sound.add('teleport');
    this.throwtriplestar = this.sound.add('throwtriplestar');
    this.throwbigstar = this.sound.add('throwbigstar');
    // background
    //this.add.sprite(0, 0, 'background').setOrigin(0,0);
    this.cameras.main.setBounds(0, 0, 5600 + 1400, 600);
    this.physics.world.setBounds(0, 0, 5600 + 1400, 600);
    this.add.image(0, 0, 'background1').setOrigin(0);
    this.add.image(5600, 0, 'background2').setOrigin(0);
    //this.add.image(5600, 0, 'bg').setOrigin(0);
    //boss health bar
    this.bossHealthBar = this.makeBar(5600,0,0xe74c3c);
    this.setValue(this.bossHealthBar,100);
    this.bossHealthBar.setVisible(false);
    this.bossHealthPercent = 100;
    // player
    player.sprite = this.physics.add.sprite(20, this.sys.game.config.height / 2, 'ninja');
    player.sprite.setScale(0.5);
    player.sprite.setCollideWorldBounds(true); //can't run off screen
    player.healthBar = this.makeBar(0,this.sys.game.config.height - 30,0x2ecc71);
    this.setValue(player.healthBar,player.healthPercent);
    player.healthBar.setVisible(false);
    this.cameras.main.startFollow(player.sprite, true, 0.1, 0.1);
    this.cameras.main.followOffset.set(-500, 0);
    this.playerbullets = this.physics.add.group(); //create stars
    this.playerbigbullets = this.physics.add.group(); //create stars
    // goal / end of level
    this.treasure = this.physics.add.sprite(7000 - 50, this.sys.game.config.height / 2, 'treasure');
    this.treasure.setScale(0.6);
    //boss
    this.boss = this.physics.add.sprite(7150, 300, 'boss'); //1550
    this.boss.setVisible(false);
    this.bullets = this.physics.add.group(); //create attack 1
    this.laser = this.physics.add.group(); // create attack 2
    //colliders / triggers
    this.physics.add.overlap(player.sprite, this.bullets, this.getHit, null, this); //trigger b/w player & bullets
    this.physics.add.overlap(player.sprite, this.laser, this.dot, null, this); //trigger b/w player & laser
    this.physics.add.overlap(player.sprite, this.treasure, this.gameOver, null, this); //trigger b/w player & treasure
    this.physics.add.overlap(player.sprite, this.boss, this.hitPlayer, null, this); //trigger b/w player & boss
    this.physics.add.overlap(this.boss, this.playerbullets, this.collide, null, this); //trigger b/w playerbullets & boss
    this.physics.add.overlap(this.boss, this.playerbigbullets, this.pierce, null, this); //trigger b/w playerbullets & boss
    //camera
    this.cameras.main.resetFX(); //reset cameras
    //keyboard input
    //create keyboard keys
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.zkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.xkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.ckey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    //timer testing
    this.timer = this.time.addEvent({delay : 5000, callback: this.pickAbility, callbackScope: this, loop: true, paused: true });
    this.timer2 = this.time.addEvent({delay : 5000, callback: this.abilityThree, callbackScope: this, loop: true, paused: true });

    //debugging / things to remove later
    this.timerText = this.add.text(6000, 100, "got here", { fontSize: '20px', fill: '#FFFFFF', align: "center" });
    this.text = this.add.text(6000,150,"");
  }

  update()
  {
    this.timerText.setText("timer progress: " + this.timer.getProgress().toString().substr(0,4));
    //check if player is alive
    if (!player.isAlive) {
      return;
    }
    // check for active input
    if (this.cursors.right.isDown) {
      // player walks
      player.sprite.x += player.speed;
    } else if (this.cursors.left.isDown) {
      player.sprite.x -= player.speed;
    }
    if (this.cursors.up.isDown) {
      player.sprite.y -= player.speed;
    } else if (this.cursors.down.isDown){
      player.sprite.y += player.speed;
    }

    if (player.sprite.x + 17 > 6000) { //400
      this.startBoss = true;
      this.cameras.main.setBounds(5600, 0, 1300, 560);
      this.physics.world.setBounds(5600, 30, 1400, 560);
    }
    if (this.startBoss){
      player.healthBar.setVisible(true);
      this.bossHealthBar.setVisible(true);
      this.boss.setVisible(true);
      this.boss.x -= this.bossSpeed;
      this.timer.paused = false;
    }
    if (this.boss.x < 7000 + 150 && this.boss.x > 7000 + 140){ //this.sys.game.config.width
      this.dinogrowl.play();
    }
    if (this.boss.x <= this.bossMinX) {
      this.bossSpeed = 0;
      this.boss.setCollideWorldBounds(true);
    }
    if (this.bossHP <= 0) {
      this.bossAlive = false;
      this.boss.disableBody(true, true);
      this.boss.setActive(false);
      this.boss.setVisible(false);
      this.timer.paused = true;
    }
    //ability three
    if (this.timer.getProgress().toString().substr(0,4) < 0.4){
      if (this.timer2.getProgress().toString().substr(0,4) >= 0.05 && this.timer2.getProgress().toString().substr(0,4) <= 0.25){
        this.physics.moveToObject(this.boss, player.sprite, 700);
      }
      else if (this.timer2.getProgress().toString().substr(0,4) > 0.25 && this.timer2.getProgress().toString().substr(0,4) <= 0.5){
        this.physics.moveToObject(this.boss, this.treasure, 700);
      }
    }
    //press spacebar to throw star
    if (Phaser.Input.Keyboard.JustDown(this.spacebar))
    {
      this.throwstar.play();
      let playerx = player.sprite.x;
      let playery = player.sprite.y;
      let pbullet = this.playerbullets.create(playerx, playery, 'star');
      pbullet.setVelocityX(800);
    }
    //press z key to throw 3 stars
    else if (Phaser.Input.Keyboard.JustDown(this.zkey))
    {
      this.throwtriplestar.play();
      let playerx = player.sprite.x;
      let playery = player.sprite.y;
      let pbullet1 = this.playerbullets.create(playerx, playery - 25, 'star');
      let pbullet2 = this.playerbullets.create(playerx, playery, 'star');
      let pbullet3 = this.playerbullets.create(playerx, playery + 25, 'star');
      pbullet1.setVelocityX(800);
      pbullet1.setVelocityY(-100);
      pbullet2.setVelocityX(800);
      pbullet3.setVelocityX(800);
      pbullet3.setVelocityY(100);
    }
    //press x key to throw big piercing star
    else if (Phaser.Input.Keyboard.JustDown(this.xkey))
    {
      this.throwbigstar.play();
      let playerx = player.sprite.x;
      let playery = player.sprite.y;
      let pbullet = this.playerbigbullets.create(playerx, playery, 'starbig');
      pbullet.setVelocityX(800);
    }
    //press c key to teleport 100 pixels in direction of arrow key
    else if (Phaser.Input.Keyboard.JustDown(this.ckey))
    {
      this.teleport.play();
      if (this.cursors.right.isDown){
        player.sprite.x += 100;
      }
      else if (this.cursors.left.isDown){
        player.sprite.x -= 100;
      }
      else if (this.cursors.up.isDown){
        player.sprite.y -= 100;
      }
      else if (this.cursors.down.isDown){
        player.sprite.y += 100;
      }
    }
  }

  makeBar(x, y, color){
    //draw the bar
    let bar = this.add.graphics();
    //color the bar
    bar.fillStyle(color, 1);
    //fill the bar with a rectangle
    bar.fillRect(0, 0, this.sys.game.config.width, 30);
    //position the bar
    bar.x = x;
    bar.y = y;
    //return the bar
    return bar;
  }

  setValue(bar, percentage){
    //scale the bar
    bar.scaleX = percentage/100;
  }

  pickAbility()
  {
    var ability = Math.floor(Math.random() * 3) + 1;
    this.text.setText("Boss is using ability: " + ability);
    this.useAbility(ability);
  }

  useAbility(ability){
    if(ability == 1)
    {
      this.abilityOne();
    } else if (ability == 2)
    {
      this.abilityTwo();
    } else {
      this.abilityThree();
    }
  }

  abilityOne() {
    this.ability1.play();
    console.log("using ability one");
    this.timer2.paused = true;
    this.ability3.setMute(true);
    for(let i = 0; i < 4; i++)
    {
      let x = this.boss.x;
      let y = Phaser.Math.Between(this.boss.y - 200, this.boss.y + 200); //can and should randomize this

      let bullet = this.bullets.create(x, y, 'bullet');
      bullet.setVelocityX(Phaser.Math.Between(-100,-200));
    }
  }

  abilityTwo(){
    this.ability2.play();
    console.log("using ability two");
    this.timer2.paused = true;
    this.ability3.setMute(true);
    let x = Phaser.Math.Between(5600, this.boss.x - 20);
    let y = 0;
    let laser = this.laser.create(x, y, 'laser');
    laser.setVelocityY(260);
  }

  abilityThree() {
    this.ability3.play();
    console.log("using ability three");
    this.timer2.paused = false;
    this.ability3.setMute(false);
  }

  getHit(p, bullet)
  {
    bullet.disableBody(true,true);
    player.health -= 20;
    player.healthPercent -= 20;
    this.setValue(player.healthBar, player.healthPercent);
    if(player.health <= 0) //things can happen, be safe and less than 0
    {
      this.gameOver();
    }
    console.log("player health is : " + player.health);
  }

  dot(p, laser) {
    if (player.sprite.x >= 200){
      player.health -= 30;
      player.healthPercent-= 30;
      this.setValue(player.healthBar, player.healthPercent);
      player.sprite.x = player.sprite.x- 150;
      player.sprite.tint = Math.random() * 0xffffff;
      this.cameras.main.shake(300);
      console.log("player health is : " + player.health);
    }
    else{
      player.health -= 30;
      player.healthPercent -= 30;
      this.setValue(player.healthBar, player.healthPercent);
      player.sprite.x = player.sprite.x + 200;
      this.laser.tint = Math.random() * 0xffffff;
      this.cameras.main.shake(300);
      console.log("player health is : " + player.health);
    }
    if (player.health<= 0){
      this.gameOver();
    }
  }

  hitPlayer(p, boss)
  {
    player.health -= 1;
    player.healthPercent -= 1;
    this.setValue(player.healthBar, player.healthPercent);
    this.cameras.main.shake(400, 0.01); //duration, intensity
    if(player.health <= 0) //things can happen, be safe and less than 0
    {
      this.gameOver();
    }
    console.log("player health is : " + player.health);
  }

  hitBoss(p, boss)
  {
    this.bossHealthPercent -= 33.33;
    this.setValue(this.bossHealthBar, this.bossHealthPercent);
    this.cameras.main.shake(400, 0.01); //duration, intensity
    this.bossHP -= 1;
    this.boss.x = 7150; //1550
    this.bossSpeed = 2;
  }

  collide (boss, pbullet)
  {
    pbullet.disableBody(true,true);
    this.bossHealthPercent -= 1;
    this.bossHP -= 1;
    this.setValue(this.bossHealthBar, this.bossHealthPercent);
    //this.cameras.main.shake(400, 0.01); //duration, intensity
  }

  pierce (boss, pbullet)
  {
    this.bossHealthPercent -= 0.1;
    this.bossHP -= 0.1;
    this.setValue(this.bossHealthBar, this.bossHealthPercent);
  }

  gameOver()
  {
    // flag to set player is dead
    player.isAlive = false;
    // shake the camera
    this.cameras.main.shake(500);
    // fade camera
    this.time.delayedCall(250, function() {
      this.cameras.main.fade(250);
    }, [], this);
    // restart game
    this.time.delayedCall(500, function() {
      this.scene.restart();
    }, [], this);
  }

}
