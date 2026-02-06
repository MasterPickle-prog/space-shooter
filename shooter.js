   const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const container = document.getElementById('gameContainer');
        
        canvas.width = 800;
        canvas.height = 600;

        
        let score = 0;
        let lives = 3;
        let gameRunning = false;
        let gameStarted = false;
        let keys = {};
        let gameTime = 0; 
        let roundNumber = 0; 
        let upgradesPending = false;
        let obtainedUpgrades = []; 
        
        
        let fireRateMultiplier = 1;
        let playerSizeMultiplier = 1;
        let hasMinions = false;
        let hasGrenades = false;
        let hasCommander = false;
        let shootDirection = { x: 0, y: -1 }; 

        
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
        let bulletAngle = 0; 

        
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
        
        
        const availableUpgrades = [
            {
                id: 'firerate',
                name: 'Fire Rate',
                description: 'Doubles your current fire rate'
            },
            {
                id: 'tanky',
                name: 'Tanky',
                description: 'Get +1 life. Ship grows 1.05x bigger'
            },
            {
                id: 'minions',
                name: 'Minions',
                description: 'Two small shooters assist you on each side'
            },
            {
                id: 'grenade',
                name: 'Grenade Launcher',
                description: '20% chance to fire explosive grenades'
            },
            {
                id: 'commander',
                name: 'Commander',
                description: 'Aim your shots left/right with A and D keys'
            }
        ];
        
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
            
            
            if (hasCommander) {
                if (e.key === 'ArrowUp') {
                    shootDirection = { x: 0, y: -1 };
                } else if (e.key === 'ArrowDown') {
                    shootDirection = { x: 0, y: 1 };
                } else if (e.key === 'ArrowLeft') {
                    shootDirection = { x: -1, y: 0 };
                } else if (e.key === 'ArrowRight') {
                    shootDirection = { x: 1, y: 0 };
                }
            }
            
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
            
            
            roundNumber = 0;
            obtainedUpgrades = [];
            fireRateMultiplier = 1;
            playerSizeMultiplier = 1;
            hasMinions = false;
            hasGrenades = false;
            hasCommander = false;
            shootDirection = { x: 0, y: -1 };
            
            gameTime = 0;
            gameStarted = true;
            
            
            showUpgradeScreen();
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
            roundNumber = 0;
            obtainedUpgrades = [];
            fireRateMultiplier = 1;
            playerSizeMultiplier = 1;
            hasMinions = false;
            hasGrenades = false;
            hasCommander = false;
            shootDirection = { x: 0, y: -1 };
            gameRunning = false;
            gameStarted = false;
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('titleScreen').style.display = 'flex';
            document.getElementById('quitBtn').classList.remove('show');
            updateUI();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        function showUpgradeScreen() {
            gameRunning = false;
            upgradesPending = true;
            document.getElementById('upgradeScreen').style.display = 'flex';
            
            
            const remaining = availableUpgrades.filter(u => !obtainedUpgrades.includes(u.id));
            
            console.log('Obtained upgrades:', obtainedUpgrades);
            console.log('Remaining upgrades:', remaining.map(u => u.id));
            
            const selected = [];
            
            while (selected.length < 3 && remaining.length > 0) {
                const index = Math.floor(Math.random() * remaining.length);
                selected.push(remaining[index]);
                remaining.splice(index, 1);
            }
            
            
            while (selected.length < 3) {
                selected.push({
                    id: 'maxed',
                    name: 'Fully Upgraded!',
                    description: 'You have unlocked all available upgrades'
                });
            }
            
            
            const container = document.getElementById('upgradeCards');
            container.innerHTML = '';
            
            selected.forEach(upgrade => {
                const card = document.createElement('div');
                card.className = 'upgrade-card';
                if (upgrade.id === 'maxed') {
                    card.className += ' upgrade-card-disabled';
                }
                card.innerHTML = `
                    <h3>${upgrade.name}</h3>
                    <p>${upgrade.description}</p>
                `;
                if (upgrade.id !== 'maxed') {
                    card.onclick = () => selectUpgrade(upgrade.id);
                }
                container.appendChild(card);
            });
        }
        
        function selectUpgrade(upgradeId) {
            obtainedUpgrades.push(upgradeId);
            
            
            switch(upgradeId) {
                case 'firerate':
                    fireRateMultiplier *= 2;
                    break;
                case 'tanky':
                    lives++;
                    playerSizeMultiplier *= 1.05;
                    updateUI();
                    break;
                case 'minions':
                    hasMinions = true;
                    break;
                case 'grenade':
                    hasGrenades = true;
                    break;
                case 'commander':
                    hasCommander = true;
                    break;
            }
            
            
            document.getElementById('upgradeScreen').style.display = 'none';
            upgradesPending = false;
            gameRunning = true;
            gameLoop();
        }

        function drawPlayer() {
            const currentWidth = player.width * playerSizeMultiplier;
            const currentHeight = player.height * playerSizeMultiplier;
            
            
            if (activePowerups.shield) {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(player.x + currentWidth / 2, player.y + currentHeight / 2, currentWidth, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(player.x + currentWidth / 2, player.y);
            ctx.lineTo(player.x, player.y + currentHeight);
            ctx.lineTo(player.x + currentWidth, player.y + currentHeight);
            ctx.closePath();
            ctx.fill();

            
            ctx.fillStyle = '#0088ff';
            ctx.beginPath();
            ctx.arc(player.x + currentWidth / 2, player.y + currentHeight / 2, 8 * playerSizeMultiplier, 0, Math.PI * 2);
            ctx.fill();
            
            
            ctx.save();
            
            const cannonX = player.x + currentWidth / 2;
            const cannonY = player.y + currentHeight / 3;
            
            
            ctx.translate(cannonX, cannonY);
            ctx.rotate(bulletAngle);
            
            
            ctx.fillStyle = '#ffaa00';
            const cannonWidth = 6 * playerSizeMultiplier;
            const cannonLength = 15 * playerSizeMultiplier;
            ctx.fillRect(-cannonWidth / 2, -cannonLength, cannonWidth, cannonLength);
            
            
            ctx.fillStyle = '#ff6600';
            const tipSize = 4 * playerSizeMultiplier;
            ctx.fillRect(-tipSize / 2, -cannonLength - 2, tipSize, tipSize);
            
            ctx.restore();
            
            
            if (hasMinions) {
                const minionSize = 20;
                const minionOffset = 50;
                
                
                ctx.fillStyle = '#00aaaa';
                ctx.beginPath();
                ctx.moveTo(player.x - minionOffset + minionSize / 2, player.y + 10);
                ctx.lineTo(player.x - minionOffset, player.y + minionSize + 10);
                ctx.lineTo(player.x - minionOffset + minionSize, player.y + minionSize + 10);
                ctx.closePath();
                ctx.fill();
                
                
                ctx.beginPath();
                ctx.moveTo(player.x + currentWidth + minionOffset + minionSize / 2, player.y + 10);
                ctx.lineTo(player.x + currentWidth + minionOffset, player.y + minionSize + 10);
                ctx.lineTo(player.x + currentWidth + minionOffset + minionSize, player.y + minionSize + 10);
                ctx.closePath();
                ctx.fill();
            }
        }

        function drawBullets() {
            
            bullets.forEach(bullet => {
                if (bullet.isGrenade) {
                    ctx.fillStyle = '#ff6600';
                    ctx.beginPath();
                    ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.save();
                    
                    
                    if (bullet.angle !== undefined) {
                        ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
                        ctx.rotate(bullet.angle);
                        ctx.translate(-(bullet.x + bullet.width / 2), -(bullet.y + bullet.height / 2));
                    }
                    
                    ctx.fillStyle = '#ffff00';
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    ctx.restore();
                }
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
            
            
            if (hasCommander) {
                const maxAngle = Math.PI / 4; 
                if (keys['a'] || keys['A']) {
                    bulletAngle = Math.max(bulletAngle - 0.05, -maxAngle);
                }
                if (keys['d'] || keys['D']) {
                    bulletAngle = Math.min(bulletAngle + 0.05, maxAngle);
                }
                
                
                if (!keys['a'] && !keys['A'] && !keys['d'] && !keys['D']) {
                    if (Math.abs(bulletAngle) > 0.01) {
                        bulletAngle *= 0.9;
                    } else {
                        bulletAngle = 0;
                    }
                }
            } else {
                
                bulletAngle = 0;
            }
        }

        function shoot() {
            const now = Date.now();
            const baseDelay = activePowerups.rapidFire ? powerupTypes.rapidFire.shootDelay : shootDelay;
            const currentShootDelay = baseDelay / fireRateMultiplier;
            
            if (now - lastShot > currentShootDelay) {
                const currentWidth = player.width * playerSizeMultiplier;
                const isGrenade = hasGrenades && Math.random() < 0.2;
                
                if (activePowerups.multiShot) {
                    
                    createBullet(player.x + currentWidth / 2 - 2, player.y, 0, isGrenade);
                    createBullet(player.x + currentWidth / 2 - 2, player.y, -2, isGrenade);
                    createBullet(player.x + currentWidth / 2 - 2, player.y, 2, isGrenade);
                } else {
                    
                    createBullet(player.x + currentWidth / 2 - 2, player.y, 0, isGrenade);
                }
                
                
                if (hasMinions) {
                    const minionSize = 20;
                    const minionOffset = 50;
                    createBullet(player.x - minionOffset + minionSize / 2 - 2, player.y + 10, 0, false);
                    createBullet(player.x + currentWidth + minionOffset + minionSize / 2 - 2, player.y + 10, 0, false);
                }
                
                lastShot = now;
            }
        }
        
        function createBullet(x, y, offsetX, isGrenade) {
            
            const angle = bulletAngle;
            
            bullets.push({
                x: x,
                y: y,
                width: isGrenade ? 8 : 4,
                height: isGrenade ? 8 : 15,
                vx: Math.sin(angle) * bulletSpeed + offsetX,
                vy: -Math.cos(angle) * bulletSpeed,
                isGrenade: isGrenade,
                angle: angle 
            });
        }

        function updateBullets() {
            
            bullets = bullets.filter(bullet => {
                bullet.y += bullet.vy || -bulletSpeed;
                bullet.x += bullet.vx || 0;
                return bullet.y > -50 && bullet.y < canvas.height + 50 && 
                       bullet.x > -50 && bullet.x < canvas.width + 50;
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
                        
                        
                        if (bullet.isGrenade) {
                            const explosionRadius = 100; 
                            const explosionX = bullet.x + bullet.width / 2;
                            const explosionY = bullet.y + bullet.height / 2;
                            
                            
                            ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
                            ctx.beginPath();
                            ctx.arc(explosionX, explosionY, explosionRadius, 0, Math.PI * 2);
                            ctx.fill();
                            
                            enemies.forEach((nearbyEnemy, nearbyIndex) => {
                                const dx = (nearbyEnemy.x + nearbyEnemy.width / 2) - explosionX;
                                const dy = (nearbyEnemy.y + nearbyEnemy.height / 2) - explosionY;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                
                                if (distance < explosionRadius) {
                                    spawnPowerup(nearbyEnemy.x + nearbyEnemy.width / 2, nearbyEnemy.y + nearbyEnemy.height / 2);
                                    score += nearbyEnemy.points;
                                    enemies.splice(nearbyIndex, 1);
                                }
                            });
                            
                            updateUI();
                            checkRoundComplete();
                            return;
                        }
                        
                        
                        if (enemy.type === 'grey') {
                            enemy.health--;
                            if (enemy.health <= 0) {
                                
                                spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                                enemies.splice(enemyIndex, 1);
                                score += enemy.points;
                                updateUI();
                                checkRoundComplete();
                            }
                        } else {
                            
                            
                            spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                            enemies.splice(enemyIndex, 1);
                            score += enemy.points;
                            updateUI();
                            checkRoundComplete();
                        }
                    }
                });
            });

            
            if (!activePowerups.shield) {
                enemies.forEach((enemy, index) => {
                    if (player.x < enemy.x + enemy.width &&
                        player.x + player.width * playerSizeMultiplier > enemy.x &&
                        player.y < enemy.y + enemy.height &&
                        player.y + player.height * playerSizeMultiplier > enemy.y) {
                        
                        
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
                    if (bullet.x < player.x + player.width * playerSizeMultiplier &&
                        bullet.x + bullet.width > player.x &&
                        bullet.y < player.y + player.height * playerSizeMultiplier &&
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
                    player.x + player.width * playerSizeMultiplier > powerup.x - powerupSize &&
                    player.y < powerup.y + powerupSize &&
                    player.y + player.height * playerSizeMultiplier > powerup.y - powerupSize) {
                    powerups.splice(index, 1);
                    
                    const duration = powerup.type === 'barrier' ? 15000 : 10000;
                    activePowerups[powerup.type] = Date.now() + duration;
                }
            });
        }
        
        function checkRoundComplete() {
            
            const killsThisRound = Math.floor(score / 100);
            if (killsThisRound > roundNumber) {
                roundNumber = killsThisRound;
                if (roundNumber === 1 || (roundNumber - 1) % 2 === 0) {
                    
                    if (obtainedUpgrades.length < availableUpgrades.length) {
                        showUpgradeScreen();
                    }
                }
            }
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
            roundNumber = 0;
            obtainedUpgrades = [];
            fireRateMultiplier = 1;
            playerSizeMultiplier = 1;
            hasMinions = false;
            hasGrenades = false;
            hasCommander = false;
            shootDirection = { x: 0, y: -1 };
            
            document.getElementById('gameOver').style.display = 'none';
            
            
            document.getElementById('legend-yellow').classList.add('locked');
            document.getElementById('legend-darkBlue').classList.add('locked');
            document.getElementById('legend-green').classList.add('locked');
            document.getElementById('legend-grey').classList.add('locked');
            document.getElementById('legend-pink').classList.add('locked');
            document.getElementById('legend-purple').classList.add('locked');
            
            updateUI();
            
            
            showUpgradeScreen();
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
