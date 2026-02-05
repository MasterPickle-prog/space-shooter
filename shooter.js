       const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const container = document.getElementById('gameContainer');
        
        canvas.width = 800;
        canvas.height = 600;

        
        let score = 0;
        let lives = 5;
        let gameRunning = false;
        let gameStarted = false;
        let keys = {};
        let gameTime = 0; 

        
        const player = {
            x: canvas.width / 2 - 20,
            y: canvas.height - 80,
            width: 40,
            height: 40,
            speed: 5
        };

        
        let bullets = [];
        const bulletSpeed = 7;
        let lastShot = 0;
        const shootDelay = 1000; 

        
        let enemies = [];
        let enemyBullets = [];
        const enemySpeed = 2;
        let lastEnemySpawn = 0;
        const enemySpawnDelay = 1000;
        
        
        let powerups = [];
        const powerupSize = 25;
        const powerupSpeed = 2;
        let activePowerups = {}; 
        let powerupEndTime = 0;
        
        const powerupTypes = {
            rapidFire: { 
                color: '#ff00ff', 
                text: 'RF',
                name: 'Rapid Fire',
                shootDelay: 200 
            },
            shield: { 
                color: '#00ffff', 
                text: 'SH',
                name: 'Shield',
                invincible: true 
            },
            multiShot: { 
                color: '#ffaa00', 
                text: 'MS',
                name: 'Multi Shot',
                bullets: 3 
            },
            speedBoost: { 
                color: '#00ff00', 
                text: 'SP',
                name: 'Speed',
                speedMultiplier: 2 
            },
            barrier: {
                color: '#ffffff',
                text: 'BR',
                name: 'Barrier',
                duration: 15000
            }
        };
        
        
        const enemyTypes = {
            red: { color: '#ff0000', speed: 0.8, size: 30, points: 10 },
            yellow: { color: '#ffff00', speed: 0.7, size: 35, points: 15 },
            darkBlue: { color: '#0000aa', speed: 1.5, size: 25, points: 20 },
            green: { color: '#00ff00', speed: 0.8, size: 30, points: 25 },
            grey: { color: '#888888', speed: 0.6, size: 40, points: 30, health: 3 },
            pink: { color: '#ff69b4', speed: 1.2, size: 28, points: 35, detonateRadius: 80 },
            purple: { color: '#9900ff', speed: 0.7, size: 32, points: 40, bulletDamage: 2 }
        };

        
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.width = Math.random() * 3 + 'px';
            star.style.height = star.style.width;
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(star);
        }

        
        document.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });

        document.getElementById('restartBtn').addEventListener('click', restart);
        document.getElementById('startBtn').addEventListener('click', startGame);
        document.getElementById('quitBtn').addEventListener('click', quitToTitle);
        
        function startGame() {
            document.getElementById('titleScreen').style.display = 'none';
            document.getElementById('quitBtn').classList.add('show');
            
            
            document.getElementById('legend-yellow').classList.add('locked');
            document.getElementById('legend-darkBlue').classList.add('locked');
            document.getElementById('legend-green').classList.add('locked');
            document.getElementById('legend-grey').classList.add('locked');
            document.getElementById('legend-pink').classList.add('locked');
            document.getElementById('legend-purple').classList.add('locked');
            
            
            powerups = [];
            activePowerups = {};
            powerupEndTime = 0;
            
            gameTime = 0;
            gameStarted = true;
            gameRunning = true;
            gameLoop();
        }
        
        function quitToTitle() {
            score = 0;
            lives = 3;
            bullets = [];
            enemies = [];
            enemyBullets = [];
            powerups = [];
            activePowerups = {};
            powerupEndTime = 0;
            player.x = canvas.width / 2 - 20;
            player.y = canvas.height - 80;
            gameTime = 0;
            gameRunning = false;
            gameStarted = false;
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('titleScreen').style.display = 'flex';
            document.getElementById('quitBtn').classList.remove('show');
            updateUI();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function drawPlayer() {
            
            if (activePowerups.shield) {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2, player.y);
            ctx.lineTo(player.x, player.y + player.height);
            ctx.lineTo(player.x + player.width, player.y + player.height);
            ctx.closePath();
            ctx.fill();

            
            ctx.fillStyle = '#0088ff';
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawBullets() {
            
            ctx.fillStyle = '#ffff00';
            bullets.forEach(bullet => {
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            });
            
            
            ctx.fillStyle = '#ff00ff';
            enemyBullets.forEach(bullet => {
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            });
        }

        function drawEnemies() {
            enemies.forEach(enemy => {
                ctx.save();
                
                
                if (enemy.type === 'yellow') {
                    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    ctx.rotate(enemy.angle);
                    ctx.translate(-(enemy.x + enemy.width / 2), -(enemy.y + enemy.height / 2));
                }
                
                
                if (enemy.type === 'pink') {
                    ctx.shadowColor = enemy.color;
                    ctx.shadowBlur = 15;
                }
                
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
                ctx.lineTo(enemy.x, enemy.y);
                ctx.lineTo(enemy.x + enemy.width, enemy.y);
                ctx.closePath();
                ctx.fill();

                
                const detailColor = enemy.type === 'red' ? '#ff6600' : 
                                   enemy.type === 'yellow' ? '#ffaa00' :
                                   enemy.type === 'darkBlue' ? '#0066ff' : 
                                   enemy.type === 'green' ? '#00aa00' :
                                   enemy.type === 'grey' ? '#555555' :
                                   enemy.type === 'pink' ? '#ff1493' : '#6600cc';
                ctx.fillStyle = detailColor;
                ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
                ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 5, 5, 5);
                
                ctx.shadowBlur = 0;
                
                
                if (enemy.type === 'grey' && enemy.maxHealth > 1) {
                    const barWidth = enemy.width;
                    const barHeight = 4;
                    const healthPercent = enemy.health / enemy.maxHealth;
                    
                    
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(enemy.x, enemy.y - 8, barWidth, barHeight);
                    
                    
                    ctx.fillStyle = '#00ff00';
                    ctx.fillRect(enemy.x, enemy.y - 8, barWidth * healthPercent, barHeight);
                }
                
                ctx.restore();
            });
        }

        function updatePlayer() {
            const currentSpeed = activePowerups.speedBoost ? player.speed * powerupTypes.speedBoost.speedMultiplier : player.speed;
            
            if (keys['ArrowLeft'] && player.x > 0) {
                player.x -= currentSpeed;
            }
            if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
                player.x += currentSpeed;
            }
            if (keys['ArrowUp'] && player.y > canvas.height / 2) {
                player.y -= currentSpeed;
            }
            if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
                player.y += currentSpeed;
            }
        }

        function shoot() {
            const now = Date.now();
            const currentShootDelay = activePowerups.rapidFire ? powerupTypes.rapidFire.shootDelay : shootDelay;
            
            if (now - lastShot > currentShootDelay) {
                if (activePowerups.multiShot) {
                    
                    bullets.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        width: 4,
                        height: 15,
                        vx: 0,
                        vy: -bulletSpeed
                    });
                    bullets.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        width: 4,
                        height: 15,
                        vx: -2,
                        vy: -bulletSpeed
                    });
                    bullets.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        width: 4,
                        height: 15,
                        vx: 2,
                        vy: -bulletSpeed
                    });
                } else {
                    
                    bullets.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        width: 4,
                        height: 15,
                        vx: 0,
                        vy: -bulletSpeed
                    });
                }
                lastShot = now;
            }
        }

        function updateBullets() {
            
            bullets = bullets.filter(bullet => {
                bullet.y += bullet.vy || -bulletSpeed;
                bullet.x += bullet.vx || 0;
                return bullet.y > 0 && bullet.x > -10 && bullet.x < canvas.width + 10;
            });
            
            
            enemyBullets = enemyBullets.filter(bullet => {
                bullet.y += 5; 
                return bullet.y < canvas.height;
            });
        }

        function spawnEnemy() {
            const now = Date.now();
            if (now - lastEnemySpawn > enemySpawnDelay) {
                
                let availableTypes = [];
                
                
                availableTypes.push('red');
                
                
                if (gameTime > 10000) {
                    availableTypes.push('yellow');
                }
                
                
                if (gameTime > 20000) {
                    availableTypes.push('darkBlue');
                }
                
                
                if (gameTime > 30000) {
                    availableTypes.push('green');
                }
                
                
                if (gameTime > 40000) {
                    availableTypes.push('grey');
                }
                
                
                if (gameTime > 50000) {
                    availableTypes.push('pink');
                }
                
                
                if (gameTime > 60000) {
                    availableTypes.push('purple');
                }
                
                
                const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                const enemyData = enemyTypes[randomType];
                
                
                const speedMultiplier = Math.min(1 + (gameTime / 120000), 1.5);
                
                enemies.push({
                    x: Math.random() * (canvas.width - enemyData.size),
                    y: -enemyData.size,
                    width: enemyData.size,
                    height: enemyData.size,
                    type: randomType,
                    color: enemyData.color,
                    speed: enemyData.speed * speedMultiplier,
                    originalSpeed: enemyData.speed * speedMultiplier, 
                    points: enemyData.points,
                    targetX: null, 
                    lastShot: 0, 
                    angle: 0, 
                    health: enemyData.health || 1, 
                    maxHealth: enemyData.health || 1
                });
                lastEnemySpawn = now;
            }
        }
        
        function spawnPowerup(x, y) {
            
            if (Math.random() < 0.1) {
                const types = Object.keys(powerupTypes);
                const randomType = types[Math.floor(Math.random() * types.length)];
                const powerupData = powerupTypes[randomType];
                
                powerups.push({
                    x: x,
                    y: y,
                    type: randomType,
                    color: powerupData.color,
                    text: powerupData.text
                });
            }
        }
        
        function updatePowerups() {
            powerups = powerups.filter(powerup => {
                powerup.y += powerupSpeed;
                return powerup.y < canvas.height;
            });
            
            
            const now = Date.now();
            Object.keys(activePowerups).forEach(key => {
                if (now > activePowerups[key]) {
                    delete activePowerups[key];
                }
            });
        }
        
        function drawPowerups() {
            powerups.forEach(powerup => {
                
                ctx.fillStyle = powerup.color;
                ctx.beginPath();
                ctx.arc(powerup.x, powerup.y, powerupSize, 0, Math.PI * 2);
                ctx.fill();
                
                
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 12px Courier New';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(powerup.text, powerup.x, powerup.y);
            });
        }
        
        function drawBarrier() {
            if (activePowerups.barrier) {
                const barrierY = canvas.height * 0.4; 
                const barrierHeight = 5;
                
                
                const opacity = 0.3 + Math.sin(Date.now() / 100) * 0.2;
                
                
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fillRect(0, barrierY, canvas.width, barrierHeight);
                
                
                ctx.strokeStyle = `rgba(0, 255, 255, ${opacity + 0.3})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, barrierY + barrierHeight / 2);
                ctx.lineTo(canvas.width, barrierY + barrierHeight / 2);
                ctx.stroke();
                
                
                for (let i = 0; i < 10; i++) {
                    const x = (Date.now() / 10 + i * 80) % canvas.width;
                    ctx.fillStyle = `rgba(0, 255, 255, ${opacity + 0.4})`;
                    ctx.beginPath();
                    ctx.arc(x, barrierY + barrierHeight / 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        function updateEnemies() {
            const barrierY = canvas.height * 0.4;
            
            enemies = enemies.filter(enemy => {
                
                if (enemy.type === 'yellow') {
                    
                    if (enemy.y > 50) {
                        
                        const targetX = player.x + player.width / 2;
                        const targetY = player.y + player.height / 2;
                        const currentX = enemy.x + enemy.width / 2;
                        const currentY = enemy.y + enemy.height / 2;
                        
                        const dx = targetX - currentX;
                        const dy = targetY - currentY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        
                        enemy.angle = Math.atan2(dy, dx) - Math.PI / 2;
                        
                        
                        if (distance > 2) {
                            enemy.x += (dx / distance) * enemy.speed * 1.5;
                            enemy.y += (dy / distance) * enemy.speed * 1.5;
                        } else {
                            enemy.y += enemy.speed;
                        }
                    } else {
                        
                        enemy.y += enemy.speed;
                        enemy.angle = 0;
                    }
                } else if (enemy.type === 'green' || enemy.type === 'purple') {
                    
                    const now = Date.now();
                    const shootInterval = enemy.type === 'purple' ? 1200 : 1500;
                    
                    if (now - enemy.lastShot > shootInterval && enemy.y > 50 && enemy.y < canvas.height - 100) {
                        enemyBullets.push({
                            x: enemy.x + enemy.width / 2 - 2,
                            y: enemy.y + enemy.height,
                            width: 4,
                            height: 10,
                            damage: enemy.type === 'purple' ? 2 : 1
                        });
                        enemy.lastShot = now;
                    }
                    enemy.y += enemy.speed;
                } else if (enemy.type === 'pink') {
                    
                    const dx = (enemy.x + enemy.width / 2) - (player.x + player.width / 2);
                    const dy = (enemy.y + enemy.height / 2) - (player.y + player.height / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < enemyTypes.pink.detonateRadius && !activePowerups.shield) {
                        
                        lives = 0; 
                        updateUI();
                        endGame();
                        return false;
                    }
                    
                    enemy.y += enemy.speed;
                } else {
                    
                    enemy.y += enemy.speed;
                }
                
                
                if (activePowerups.barrier && enemy.y + enemy.height >= barrierY && enemy.y < barrierY + 20) {
                    
                    enemy.y = barrierY - enemy.height;
                    enemy.stoppedByBarrier = true;
                    enemy.speed = 0; 
                } else if (enemy.stoppedByBarrier && !activePowerups.barrier) {
                    
                    enemy.speed = enemy.originalSpeed;
                    enemy.stoppedByBarrier = false;
                }
                
                
                if (enemy.y > canvas.height) {
                    lives--;
                    updateUI();
                    if (lives <= 0) {
                        endGame();
                    }
                    return false;
                }
                return true;
            });
        }

        function checkCollisions() {
            
            bullets.forEach((bullet, bulletIndex) => {
                enemies.forEach((enemy, enemyIndex) => {
                    if (bullet.x < enemy.x + enemy.width &&
                        bullet.x + bullet.width > enemy.x &&
                        bullet.y < enemy.y + enemy.height &&
                        bullet.y + bullet.height > enemy.y) {
                        bullets.splice(bulletIndex, 1);
                        
                        
                        if (enemy.type === 'grey') {
                            enemy.health--;
                            if (enemy.health <= 0) {
                                
                                spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                                enemies.splice(enemyIndex, 1);
                                score += enemy.points;
                                updateUI();
                            }
                        } else {
                            
                            
                            spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                            enemies.splice(enemyIndex, 1);
                            score += enemy.points;
                            updateUI();
                        }
                    }
                });
            });

            
            if (!activePowerups.shield) {
                enemies.forEach((enemy, index) => {
                    if (player.x < enemy.x + enemy.width &&
                        player.x + player.width > enemy.x &&
                        player.y < enemy.y + enemy.height &&
                        player.y + player.height > enemy.y) {
                        
                        
                        if (enemy.type === 'pink') {
                            lives = 0; 
                        } else {
                            lives--;
                        }
                        
                        enemies.splice(index, 1);
                        updateUI();
                        if (lives <= 0) {
                            endGame();
                        }
                    }
                });
            }
            
            
            if (!activePowerups.shield) {
                enemyBullets.forEach((bullet, index) => {
                    if (bullet.x < player.x + player.width &&
                        bullet.x + bullet.width > player.x &&
                        bullet.y < player.y + player.height &&
                        bullet.y + bullet.height > player.y) {
                        enemyBullets.splice(index, 1);
                        
                        
                        const damage = bullet.damage || 1;
                        lives -= damage;
                        
                        updateUI();
                        if (lives <= 0) {
                            endGame();
                        }
                    }
                });
            }
            
            
            powerups.forEach((powerup, index) => {
                if (player.x < powerup.x + powerupSize &&
                    player.x + player.width > powerup.x - powerupSize &&
                    player.y < powerup.y + powerupSize &&
                    player.y + player.height > powerup.y - powerupSize) {
                    powerups.splice(index, 1);
                    
                    const duration = powerup.type === 'barrier' ? 15000 : 10000;
                    activePowerups[powerup.type] = Date.now() + duration;
                }
            });
        }

        function updateUI() {
            document.getElementById('score').textContent = score;
            document.getElementById('lives').textContent = lives;
            
            
            const powerupDisplay = document.getElementById('powerupDisplay');
            const powerupName = document.getElementById('powerupName');
            
            const activePowerupNames = Object.keys(activePowerups).map(key => powerupTypes[key].name);
            
            if (activePowerupNames.length > 0) {
                powerupDisplay.style.display = 'block';
                powerupName.textContent = activePowerupNames.join(' + ');
                powerupName.style.color = '#ffff00';
            } else {
                powerupDisplay.style.display = 'none';
            }
            
            
            if (gameTime > 10000) {
                document.getElementById('legend-yellow').classList.remove('locked');
            }
            if (gameTime > 20000) {
                document.getElementById('legend-darkBlue').classList.remove('locked');
            }
            if (gameTime > 30000) {
                document.getElementById('legend-green').classList.remove('locked');
            }
            if (gameTime > 40000) {
                document.getElementById('legend-grey').classList.remove('locked');
            }
            if (gameTime > 50000) {
                document.getElementById('legend-pink').classList.remove('locked');
            }
            if (gameTime > 60000) {
                document.getElementById('legend-purple').classList.remove('locked');
            }
        }

        function endGame() {
            gameRunning = false;
            document.getElementById('finalScore').textContent = score;
            document.getElementById('gameOver').style.display = 'block';
        }

        function restart() {
            score = 0;
            lives = 3;
            bullets = [];
            enemies = [];
            enemyBullets = [];
            powerups = [];
            activePowerups = {};
            powerupEndTime = 0;
            player.x = canvas.width / 2 - 20;
            player.y = canvas.height - 80;
            gameTime = 0;
            gameRunning = false;
            gameStarted = false;
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('titleScreen').style.display = 'flex';
            document.getElementById('quitBtn').classList.remove('show');
            updateUI();
        }

        function gameLoop() {
            if (!gameRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            updatePlayer();
            
            
            shoot();
            
            updateBullets();
            spawnEnemy();
            updateEnemies();
            updatePowerups();
            checkCollisions();

            drawPlayer();
            drawBullets();
            drawEnemies();
            drawBarrier(); 
            drawPowerups();
            
            
            updateUI();
            
            
            gameTime += 16; 

            requestAnimationFrame(gameLoop);
        }

        
        updateUI();