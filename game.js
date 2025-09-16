// F-18 Super Hornet Flight Simulator
class FlightSimulator {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Estado do jogo
        this.gameState = 'loading';
        this.lastTime = 0;
        
        // Sprites e texturas
        this.aircraftSprite = new Image();
        this.aircraftSprite.src = 'f18_sprite.png';
        this.terrainTexture = new Image();
        this.terrainTexture.src = 'terrain_texture.png';
        this.cloudTexture = new Image();
        this.cloudTexture.src = 'cloud_texture.png';
        this.skyTexture = new Image();
        this.skyTexture.src = 'sky_gradient.png';
        
        this.assetsLoaded = 0;
        this.totalAssets = 4;
        
        const onAssetLoad = () => {
            this.assetsLoaded++;
        };
        
        this.aircraftSprite.onload = onAssetLoad;
        this.terrainTexture.onload = onAssetLoad;
        this.cloudTexture.onload = onAssetLoad;
        this.skyTexture.onload = onAssetLoad;
        
        // Propriedades do avião
        this.aircraft = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            z: 1000, // altitude em pés
            vx: 0, // velocidade horizontal
            vy: 0, // velocidade vertical
            vz: 0, // velocidade de altitude
            heading: 0, // direção em graus
            pitch: 0, // inclinação para cima/baixo
            roll: 0, // inclinação lateral
            throttle: 0.3, // aceleração (0-1)
            fuel: 100, // combustível em %
            speed: 150, // velocidade em nós
            maxSpeed: 1200, // velocidade máxima Mach 1.8 ≈ 1200 kt
            afterburner: false
        };
        
        // Controles
        this.keys = {};
        this.setupControls();
        
        // Ambiente
        this.clouds = [];
        this.generateClouds();
        
        // Inicializar
        this.init();
    }
    
    init() {
        // Aguardar carregamento de todos os assets
        const checkAssets = () => {
            if(this.assetsLoaded >= this.totalAssets) {
                document.getElementById('loading').style.display = 'none';
                this.gameState = 'playing';
                this.gameLoop();
            } else {
                document.getElementById('loading').innerHTML = 
                    `Carregando F-18 Super Hornet...<br>Assets: ${this.assetsLoaded}/${this.totalAssets}`;
                setTimeout(checkAssets, 100);
            }
        };
        
        setTimeout(checkAssets, 500);
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Prevenir scroll da página
            if(['w', 's', 'a', 'd', 'q', 'e', ' '].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    generateClouds() {
        for(let i = 0; i < 30; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width * 4 - this.canvas.width,
                y: Math.random() * this.canvas.height * 4 - this.canvas.height,
                z: Math.random() * 30000 + 5000, // altitude das nuvens
                size: Math.random() * 80 + 40,
                opacity: Math.random() * 0.6 + 0.4,
                type: Math.random() > 0.7 ? 'storm' : 'normal',
                drift: {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5
                }
            });
        }
    }
    
    handleInput() {
        const aircraft = this.aircraft;
        
        // Fatores de responsividade baseados na velocidade
        const speedFactor = Math.min(aircraft.speed / 300, 1); // controles mais responsivos em alta velocidade
        const altitudeFactor = Math.max(0.3, 1 - aircraft.z / 50000); // controles menos responsivos em alta altitude
        const responsiveness = speedFactor * altitudeFactor;
        
        // Controles de voo com física realista
        if(this.keys['w']) {
            const pitchRate = 1.5 * responsiveness;
            aircraft.pitch = Math.min(aircraft.pitch + pitchRate, 45);
        }
        if(this.keys['s']) {
            const pitchRate = 1.5 * responsiveness;
            aircraft.pitch = Math.max(aircraft.pitch - pitchRate, -30);
        }
        
        if(this.keys['a']) {
            const yawRate = 1.2 * responsiveness;
            aircraft.heading -= yawRate;
            // Coordenação de curva - roll automático
            aircraft.roll = Math.max(aircraft.roll - 2, -45);
        }
        if(this.keys['d']) {
            const yawRate = 1.2 * responsiveness;
            aircraft.heading += yawRate;
            // Coordenação de curva - roll automático
            aircraft.roll = Math.min(aircraft.roll + 2, 45);
        }
        
        // Controles de roll manuais
        if(this.keys['q']) aircraft.roll = Math.max(aircraft.roll - 2.5, -60);
        if(this.keys['e']) aircraft.roll = Math.min(aircraft.roll + 2.5, 60);
        
        // Controles de velocidade com inércia
        if(this.keys['shift']) {
            aircraft.throttle = Math.min(aircraft.throttle + 0.015, 1);
        }
        if(this.keys['control']) {
            aircraft.throttle = Math.max(aircraft.throttle - 0.02, 0);
        }
        
        // Afterburner (só funciona com throttle alto)
        if(this.keys[' '] && aircraft.throttle > 0.8 && aircraft.fuel > 5) {
            aircraft.afterburner = true;
        } else {
            aircraft.afterburner = false;
        }
        
        // Normalizar ângulos
        if(aircraft.heading < 0) aircraft.heading += 360;
        if(aircraft.heading >= 360) aircraft.heading -= 360;
        
        // Retorno gradual ao centro (trim automático)
        if(!this.keys['q'] && !this.keys['e'] && !this.keys['a'] && !this.keys['d']) {
            aircraft.roll *= 0.92; // retorno mais rápido do roll
        }
        if(!this.keys['w'] && !this.keys['s']) {
            // Trim de pitch baseado na velocidade
            const trimPitch = (aircraft.speed - 250) * 0.02; // pitch up em baixa velocidade
            aircraft.pitch += (trimPitch - aircraft.pitch) * 0.02;
        }
        
        // Limitações físicas em alta velocidade
        if(aircraft.speed > 800) {
            const highSpeedFactor = (aircraft.speed - 800) / 400;
            aircraft.pitch *= (1 - highSpeedFactor * 0.3);
            aircraft.roll *= (1 - highSpeedFactor * 0.2);
        }
    }
    
    updatePhysics(deltaTime) {
        const aircraft = this.aircraft;
        const dt = deltaTime / 1000; // converter para segundos
        
        // Constantes físicas realistas para F-18 Super Hornet
        const maxThrust = 44000; // lbs (dois motores F414-GE-400)
        const weight = 32100; // lbs peso vazio
        const maxWeight = 66000; // lbs peso máximo
        const wingArea = 500; // ft² área da asa
        const dragCoeff = 0.022; // coeficiente de arrasto
        const liftCoeff = 1.2; // coeficiente de sustentação
        const airDensity = 0.002377 * Math.exp(-aircraft.z / 30000); // densidade do ar por altitude
        
        // Peso atual baseado no combustível
        const currentWeight = weight + (aircraft.fuel / 100) * (maxWeight - weight);
        
        // Calcular empuxo baseado no throttle e afterburner
        let thrust = aircraft.throttle * maxThrust * 0.85;
        if(aircraft.afterburner) {
            thrust = maxThrust * 1.5; // afterburner aumenta empuxo
        }
        
        // Velocidade em ft/s (conversão de nós)
        const speedFtS = aircraft.speed * 1.68781;
        
        // Forças aerodinâmicas
        const dynamicPressure = 0.5 * airDensity * speedFtS * speedFtS;
        const drag = dragCoeff * wingArea * dynamicPressure;
        const lift = liftCoeff * wingArea * dynamicPressure * Math.cos((aircraft.roll * Math.PI) / 180);
        
        // Força resultante
        const netForce = thrust - drag;
        const acceleration = netForce / (currentWeight / 32.174); // conversão para ft/s²
        
        // Atualizar velocidade (limitada pela resistência do ar)
        const newSpeedFtS = Math.max(0, speedFtS + acceleration * dt);
        aircraft.speed = Math.min(newSpeedFtS / 1.68781, aircraft.maxSpeed);
        
        // Física de voo 3D mais realista
        const headingRad = (aircraft.heading * Math.PI) / 180;
        const pitchRad = (aircraft.pitch * Math.PI) / 180;
        const rollRad = (aircraft.roll * Math.PI) / 180;
        
        // Velocidades baseadas na orientação 3D
        const speedFactor = aircraft.speed * dt * 0.1; // fator de escala para visualização
        
        aircraft.vx = Math.sin(headingRad) * Math.cos(pitchRad) * speedFactor;
        aircraft.vy = -Math.sin(pitchRad) * speedFactor;
        
        // Sustentação afeta a velocidade vertical
        const liftForce = lift / currentWeight;
        const verticalLift = liftForce * Math.cos(pitchRad) * Math.sin(rollRad);
        aircraft.vz = (aircraft.vy * 3600) + (verticalLift * 1000 * dt); // conversão para pés/hora
        
        // Gravidade
        const gravity = -32.174; // ft/s²
        aircraft.vz += gravity * dt * 60; // efeito da gravidade
        
        // Atualizar posição
        aircraft.x += aircraft.vx;
        aircraft.y += aircraft.vy;
        aircraft.z += aircraft.vz * dt / 60; // conversão de volta para pés
        
        // Limites da tela (mundo infinito simulado)
        if(aircraft.x < 0) aircraft.x = this.canvas.width;
        if(aircraft.x > this.canvas.width) aircraft.x = 0;
        if(aircraft.y < 0) aircraft.y = this.canvas.height;
        if(aircraft.y > this.canvas.height) aircraft.y = 0;
        
        // Limites de altitude realistas
        aircraft.z = Math.max(0, Math.min(aircraft.z, 50000));
        
        // Stall em baixa velocidade
        if(aircraft.speed < 120 && aircraft.z > 100) {
            aircraft.pitch = Math.max(aircraft.pitch - 5, -45);
        }
        
        // Compressibilidade em alta velocidade
        if(aircraft.speed > 900) {
            const compressibility = (aircraft.speed - 900) / 300;
            aircraft.pitch *= (1 - compressibility * 0.3);
            aircraft.roll *= (1 - compressibility * 0.2);
        }
        
        // Consumo de combustível realista
        const fuelFlowRate = (aircraft.throttle * 2000 + 500) / 3600; // lbs/hour base
        let fuelConsumption = fuelFlowRate * dt / 3600; // conversão para lbs/segundo
        
        if(aircraft.afterburner) {
            fuelConsumption *= 2.5; // afterburner consome muito mais
        }
        
        // Altitude afeta eficiência
        const altitudeEfficiency = 1 + (aircraft.z / 50000) * 0.3;
        fuelConsumption /= altitudeEfficiency;
        
        aircraft.fuel = Math.max(0, aircraft.fuel - (fuelConsumption / (maxWeight - weight)) * 100);
        
        // Efeitos da falta de combustível
        if(aircraft.fuel < 10) {
            aircraft.throttle = Math.min(aircraft.throttle, 0.5);
        }
        if(aircraft.fuel <= 0) {
            aircraft.throttle = 0;
            aircraft.afterburner = false;
        }
    }
    
    render() {
        const ctx = this.ctx;
        const aircraft = this.aircraft;
        
        // Limpar canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar fundo do céu com textura
        if(this.assetsLoaded >= this.totalAssets) {
            ctx.drawImage(this.skyTexture, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback para gradiente
            const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            const altitudeRatio = Math.min(aircraft.z / 30000, 1);
            
            if(altitudeRatio < 0.5) {
                skyGradient.addColorStop(0, `hsl(210, 100%, ${80 - altitudeRatio * 20}%)`);
                skyGradient.addColorStop(1, `hsl(120, 60%, ${70 - altitudeRatio * 10}%)`);
            } else {
                skyGradient.addColorStop(0, `hsl(220, 100%, ${20 + altitudeRatio * 30}%)`);
                skyGradient.addColorStop(1, `hsl(240, 80%, ${10 + altitudeRatio * 20}%)`);
            }
            
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Desenhar terreno
        this.renderTerrain();
        
        // Desenhar nuvens
        this.renderClouds();
        
        // Desenhar horizonte
        this.renderHorizon();
        
        // Desenhar avião
        this.renderAircraft();
        
        // Desenhar efeitos
        this.renderEffects();
        
        // Atualizar HUD
        this.updateHUD();
    }
    
    renderTerrain() {
        const ctx = this.ctx;
        const aircraft = this.aircraft;
        
        // Só renderizar terreno se estiver em altitude baixa o suficiente
        if(aircraft.z < 25000 && this.assetsLoaded >= this.totalAssets) {
            ctx.save();
            
            // Calcular escala baseada na altitude
            const scale = Math.max(0.1, 1 - aircraft.z / 25000);
            const terrainSize = 512; // tamanho da textura
            
            // Posição do terreno baseada na posição do avião
            const terrainX = -(aircraft.x * 0.5) % terrainSize;
            const terrainY = -(aircraft.y * 0.5) % terrainSize;
            
            // Desenhar múltiplos tiles do terreno para cobertura completa
            for(let x = -1; x <= Math.ceil(this.canvas.width / terrainSize) + 1; x++) {
                for(let y = -1; y <= Math.ceil(this.canvas.height / terrainSize) + 1; y++) {
                    const tileX = terrainX + x * terrainSize;
                    const tileY = terrainY + y * terrainSize;
                    
                    ctx.globalAlpha = scale * 0.8;
                    ctx.drawImage(
                        this.terrainTexture,
                        tileX,
                        tileY,
                        terrainSize,
                        terrainSize
                    );
                }
            }
            
            ctx.restore();
        }
    }
    
    renderClouds() {
        const ctx = this.ctx;
        const aircraft = this.aircraft;
        
        ctx.save();
        this.clouds.forEach(cloud => {
            // Parallax baseado na altitude e distância da nuvem
            const altitudeDiff = Math.abs(aircraft.z - cloud.z);
            const parallaxFactor = 1 - (altitudeDiff / 50000);
            
            if(parallaxFactor > 0) {
                const x = (cloud.x - aircraft.x * 0.2) * parallaxFactor + this.canvas.width / 2;
                const y = (cloud.y - aircraft.y * 0.2) * parallaxFactor + this.canvas.height / 2;
                
                // Só desenhar se estiver na tela
                if(x > -cloud.size && x < this.canvas.width + cloud.size &&
                   y > -cloud.size && y < this.canvas.height + cloud.size) {
                    
                    // Calcular opacidade baseada na distância de altitude
                    let opacity = cloud.opacity * parallaxFactor;
                    
                    // Efeito de névoa em baixa altitude
                    if(aircraft.z < 5000) {
                        opacity *= 0.6;
                    }
                    
                    ctx.globalAlpha = opacity;
                    
                    if(this.assetsLoaded >= this.totalAssets) {
                        // Usar textura de nuvem
                        const scale = cloud.size / 100;
                        ctx.drawImage(
                            this.cloudTexture,
                            x - cloud.size / 2,
                            y - cloud.size / 2,
                            cloud.size,
                            cloud.size
                        );
                        
                        // Nuvens de tempestade mais escuras
                        if(cloud.type === 'storm') {
                            ctx.globalAlpha = opacity * 0.3;
                            ctx.fillStyle = '#333333';
                            ctx.beginPath();
                            ctx.arc(x, y, cloud.size * 0.7, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    } else {
                        // Fallback para nuvens simples
                        ctx.fillStyle = cloud.type === 'storm' ? '#666666' : 'white';
                        ctx.beginPath();
                        ctx.arc(x, y, cloud.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    
                    // Atualizar posição da nuvem (deriva)
                    cloud.x += cloud.drift.x;
                    cloud.y += cloud.drift.y;
                }
            }
        });
        ctx.restore();
    }
    
    renderHorizon() {
        const ctx = this.ctx;
        const aircraft = this.aircraft;
        
        // Linha do horizonte baseada no pitch
        const horizonY = this.canvas.height / 2 + aircraft.pitch * 5;
        
        ctx.save();
        ctx.translate(this.canvas.width / 2, horizonY);
        ctx.rotate((aircraft.roll * Math.PI) / 180);
        
        // Céu
        ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
        ctx.fillRect(-this.canvas.width, -this.canvas.height, this.canvas.width * 2, this.canvas.height);
        
        // Terra
        ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
        ctx.fillRect(-this.canvas.width, 0, this.canvas.width * 2, this.canvas.height);
        
        // Linha do horizonte
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.canvas.width, 0);
        ctx.lineTo(this.canvas.width, 0);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderAircraft() {
        const ctx = this.ctx;
        const aircraft = this.aircraft;
        
        ctx.save();
        ctx.translate(aircraft.x, aircraft.y);
        ctx.rotate((aircraft.heading * Math.PI) / 180);
        
        if(this.assetsLoaded >= this.totalAssets) {
            // Usar sprite do F-18 Super Hornet
            const spriteWidth = 80;
            const spriteHeight = 80;
            
            // Aplicar efeito de roll (inclinação lateral)
            ctx.scale(1, Math.cos((aircraft.roll * Math.PI) / 180));
            
            ctx.drawImage(
                this.aircraftSprite,
                -spriteWidth / 2,
                -spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );
            
            // Efeito de afterburner
            if(aircraft.afterburner) {
                ctx.fillStyle = '#ff4500';
                ctx.fillRect(-spriteWidth/2 - 15, -8, 20, 16);
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(-spriteWidth/2 - 10, -4, 15, 8);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-spriteWidth/2 - 5, -2, 10, 4);
            }
        } else {
            // Fallback para desenho simples se sprite não carregar
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(-30, -5, 60, 10);
            
            // Asas
            ctx.fillStyle = '#5a5a5a';
            ctx.fillRect(-25, -20, 50, 8);
            ctx.fillRect(-25, 12, 50, 8);
            
            // Cauda
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(-35, -3, 10, 6);
            
            // Cockpit
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(15, -3, 10, 6);
            
            // Afterburner
            if(aircraft.afterburner) {
                ctx.fillStyle = '#ff4500';
                ctx.fillRect(-45, -2, 15, 4);
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(-40, -1, 10, 2);
            }
        }
        
        ctx.restore();
    }
    
    renderEffects() {
        const ctx = this.ctx;
        const aircraft = this.aircraft;
        
        // Rastro de vapor em alta velocidade
        if(aircraft.speed > 800) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for(let i = 0; i < 10; i++) {
                const trailX = aircraft.x - Math.sin((aircraft.heading * Math.PI) / 180) * i * 20;
                const trailY = aircraft.y + Math.cos((aircraft.heading * Math.PI) / 180) * i * 20;
                
                if(i === 0) ctx.moveTo(trailX, trailY);
                else ctx.lineTo(trailX, trailY);
            }
            ctx.stroke();
            ctx.restore();
        }
    }
    
    updateHUD() {
        document.getElementById('altitude').textContent = Math.round(this.aircraft.z);
        document.getElementById('speed').textContent = Math.round(this.aircraft.speed);
        document.getElementById('heading').textContent = Math.round(this.aircraft.heading);
        document.getElementById('fuel').textContent = Math.round(this.aircraft.fuel);
    }
    
    gameLoop(currentTime = 0) {
        if(this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.handleInput();
        this.updatePhysics(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new FlightSimulator();
});

