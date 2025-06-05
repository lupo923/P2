var inMenu = true
var contadorDialogo = 0
var waiting = false
var contadorLetras = 0
var faseAtual = 0
var maxEnemies = 3
var currentSpawnedEnemies = []
var velocidadeMovimentoBase = 8
var velocidadeInimigos = 6
var velocidadeTiro = 8
var segundosParaCriarNovosInimigos = 1
var currentSpawnedTirosPlayer = []
var alreadyShoot = false
var shootsPerSecond = 4
var vidaInimigo = 3
var vidaPlayer = 100
var tempoSegundaFase = 60

var intervals = []


function mainMenu() {
    setTimeout(() => {
        $('#comecar span').fadeToggle('fast')
        setTimeout(() => {
            $('#comecar span').fadeToggle('fast')
            inMenu && mainMenu()
        }, 1000);
    }, 1000);
}

function playMusic(path, volume, repeat, remove) {
    var audio = new Audio(path)
    audio.volume = volume
    audio.loop = repeat
    audio.play()
    if (remove) {
        audio.onended = function () {
            audio.remove()
        }
    }
    return audio
}

function start() {
    const dialogAudio = playMusic('./sons/Dialog.mp3', 0.05, true, false)
    faseAtual = 1
    function handleClickDialog() {
        if (faseAtual === 1) {
            if (!waiting) {
                if (contadorDialogo === 39) {
                    dialogAudio.pause()
                    dialogAudio.remove()
                    startSecondPhase()
                } else {
                    avancaDialogo()
                }
            } else {
                waiting = false
                contadorLetras = dialogs[contadorDialogo].length
            }
        } else {
            faseAtual = 2
            dialogo.off('click')
        }
    }
    function animaTextoDialogo() {
        if (waiting) {
            setTimeout(() => {
                textoDialogo.html(dialogs[contadorDialogo].slice(0, contadorLetras))
                contadorLetras++
                if (contadorLetras <= dialogs[contadorDialogo].length) {
                    animaTextoDialogo()
                } else {
                    waiting = false
                    contadorLetras = 0
                    contadorDialogo++
                }
            }, 50)
        }
    }


    function avancaDialogo() {
        waiting = true
        var dialogosMark = [1, 18, , 20, 21, 22, 23, 24, 25, 30, 31, 36, 37, 38]

        if (dialogosMark.includes(contadorDialogo)) {
            characterName.html('Mark')
            characterPotrait.css('background-image', 'url(./img/portraits/mark/neutral.webp)')
            characterPotrait.css('background-position-x', 50)
        } else {
            characterName.html('Maria')
            characterPotrait.css('background-image', 'url(./img/portraits/maria/neutral.webp)')
            characterPotrait.css('background-position-x', '')
        }
        animaTextoDialogo()
    }
    inMenu = false
    $('#comecar').hide()

    const jogo = $('#jogo')

    jogo.append("<div id='dialogoDiv' class='dialogoDiv'></div>");

    const dialogoDiv = $('#dialogoDiv')

    dialogoDiv.append("<div id='characterPortrait' class='characterPortrait'></div>")
    dialogoDiv.append("<div id='dialogo' class='dialogo'></div>")

    const dialogo = $('#dialogo')

    dialogo.append("<span id='textoDialogo' class='textoDialogo'></span>")
    dialogo.append("<span id='characterName' class='characterName'></span>")

    const characterPotrait = $('#characterPortrait')
    const characterName = $('#characterName')
    const textoDialogo = $('#textoDialogo')

    dialogo.on('click', handleClickDialog)

    characterName.html('Maria')
    avancaDialogo()

    function startSecondPhase() {

        vidaPlayer = 100
        currentSpawnedEnemies = []
        currentSpawnedTirosPlayer = []

        dialogoDiv.detach()
        jogo.append("<div id='player' class='player'></div>");
        jogo.append("<div id='vida' class='vida'></div>");
        jogo.append("<div id='vidaPlayer' class='vidaPlayer'></div>")
        jogo.append("<div id='contadorSegundos' class='contadorSegundos'></div>")
        const player = $('#player')
        player.append("<div id='playerExhaust' class='playerExhaust'></div>")
        const playerExhaust = $('#playerExhaust')
        let velocidadeMovimento = velocidadeMovimentoBase
        let vidaPlayerBarra = $('#vidaPlayer')
        let contadorSegundos = tempoSegundaFase
        const vidaBarraPlayerWidhtCheia = vidaPlayerBarra.width()

        jogo.css({
            'background-image': 'url(./img/paralax.jpg)',
            'background-repeat': 'repeat-x',
            'background-size': 'cover'
        })

        playMusic('./sons/gameBGM.mp3', 0.1, true, false)

        const paralax = setInterval(() => {
            console.log('paralax pos')
            console.log(jogo.css('background-position-x'))
            jogo.css('background-position-x', '-=1px')
        }, 1000 / 240)

        const contador = setInterval(() => {
            contadorSegundos--;
            var minutos = Math.floor(contadorSegundos / 60);
            var segundos = contadorSegundos % 60;
            var contadorElement = $('#contadorSegundos');
            contadorElement.html(minutos.toLocaleString('pt-BR', { minimumIntegerDigits: 2, useGrouping: false }) + ":" + segundos.toLocaleString('pt-BR', { minimumIntegerDigits: 2, useGrouping: false }));
            if (contadorSegundos <= 0) {
                clearInterval(contador);
                contadorElement.remove();
            }
            if (contadorSegundos === 0 && vidaPlayer > 0) {
                clearInterval(CriaInimigoInterval);
                currentSpawnedEnemies.map(enemy => enemy.remove())
                currentSpawnedEnemies = []
                startBossFight()
            }
        }, 1000);
        function updateVidaPlayerBarra() {
            if (vidaPlayer <= 0) {
                setGameOver()
                return
            }
            const newWidth = (vidaPlayer / 100) * vidaBarraPlayerWidhtCheia;
            vidaPlayerBarra.css('width', newWidth);
        }

        let isCheckingCollisions = false;

        const teclasPressionadas = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false,
            shift: false
        }

        const playerTurboSound = new Audio('./sons/turbo.mp3')

        function playTurboSound() {
            if (playerTurboSound.paused) {
                playerTurboSound.currentTime = 0
                playerTurboSound.volume = 0.1
                playerTurboSound.loop = true
                playerTurboSound.play()
            }
        }

        $(document).on('keydown', function (e) {
            switch (e.keyCode) {
                case 87:
                    teclasPressionadas.w = true
                    break;
                case 65:
                    teclasPressionadas.a = true
                    break;
                case 83:
                    teclasPressionadas.s = true
                    break;
                case 68:
                    teclasPressionadas.d = true
                    break;
                case 32:
                    teclasPressionadas.space = true
                    break;
                case 16:
                    teclasPressionadas.shift = true
                    break;
                default:
                    break;
            }
        })

        $(document).on('keyup', function (e) {
            switch (e.keyCode) {
                case 87:
                    teclasPressionadas.w = false
                    break;
                case 65:
                    teclasPressionadas.a = false
                    break;
                case 83:
                    teclasPressionadas.s = false
                    break;
                case 68:
                    teclasPressionadas.d = false
                    break;
                case 32:
                    teclasPressionadas.space = false
                    break;
                case 16:
                    playerTurboSound.pause()
                    teclasPressionadas.shift = false
                    velocidadeMovimento /= 2
                    playerExhaust.removeClass('playerExhaustBoost').addClass('playerExhaust')
                    break;
                default:
                    break;
            }
        })

        function controleNave() {


            const playerWidht = parseInt(player.css('width'))
            const playerHeight = parseInt(player.css('height'))
            const max = {
                top: 0,
                bottom: 500 - playerHeight,
                left: 0,
                right: 800 - playerWidht
            }

            if (teclasPressionadas.w) {
                const currentTop = parseInt(player.css('top'))
                if (currentTop - velocidadeMovimento >= max.top) {
                    player.css('top', currentTop - velocidadeMovimento)
                } else {
                    player.css('top', max.top)
                }
            }
            if (teclasPressionadas.s) {
                const currentTop = parseInt(player.css('top'))
                if (currentTop + velocidadeMovimento <= max.bottom) {
                    player.css('top', currentTop + velocidadeMovimento)
                } else {
                    player.css('top', max.bottom)
                }
            }
            if (teclasPressionadas.a) {
                const currentLeft = parseInt(player.css('left'))
                if (currentLeft - velocidadeMovimento >= max.left) {
                    player.css('left', currentLeft - velocidadeMovimento)
                } else {
                    player.css('left', max.left)
                }
            }
            if (teclasPressionadas.d) {
                const currentLeft = parseInt(player.css('left'))
                if (currentLeft + velocidadeMovimento <= max.right) {
                    player.css('left', currentLeft + velocidadeMovimento)
                } else {
                    player.css('left', max.right)
                }
            }

            if (teclasPressionadas.space) {
                atiraPlayer()
            }
            if (teclasPressionadas.shift) {
                playTurboSound()
                velocidadeMovimento = velocidadeMovimentoBase * 1.5
                if (playerExhaust.hasClass('playerExhaust')) {
                    playerExhaust.removeClass('playerExhaust').addClass('playerExhaustTurbo')
                }
            } else {
                velocidadeMovimento = velocidadeMovimentoBase
                if (playerExhaust.hasClass('playerExhaustTurbo')) {
                    playerExhaust.removeClass('playerExhaustTurbo').addClass('playerExhaust')
                }
            }

        }

        function criaInimigo() {
            for (let i = 1; i <= maxEnemies; i++) {
                let enemy = $(`#enemy${i}`)
                if (enemy.length === 0) {
                    jogo.append(`<div id='enemy${i}' class='enemy1'></div>`)
                    enemy = $(`#enemy${i}`)
                    const randomTop = Math.random() * (500 - enemy.height())
                    enemy.css({
                        top: `${randomTop}px`,
                        left: `${800 - enemy.width()}px`
                    })
                    enemy.append(`<div id='enemy${i}Exhaust' class='enemy1Exhaust'></div>`)
                    enemy.vida = vidaInimigo
                    currentSpawnedEnemies.push(enemy)
                    break
                }
            }
        }

        function moveInimigo() {
            if (currentSpawnedEnemies.length > 0) {
                currentSpawnedEnemies.map((enemy, idx) => {
                    const currentLeft = parseInt(enemy.css('left'))
                    enemy.css({
                        left: `${currentLeft - velocidadeInimigos}px`
                    })
                    if (currentLeft < 0 - enemy.width()) {
                        currentSpawnedEnemies.splice(idx, 1)
                        enemy.remove()
                        vidaPlayer -= 20
                    }
                })
            }
        }

        function atiraPlayer() {
            if (!alreadyShoot) {
                playMusic('./sons/tiro.mp3', 0.1, false, true)
                const playerTiroId = Date.now()
                alreadyShoot = true
                const playerPos = player.offset();
                const tiro = $(`<div class="tiroPlayer" id="${playerTiroId}"></div>`);
                tiro.css({
                    top: playerPos.top,
                    left: playerPos.left + player.width() / 2 - tiro.width() / 2
                });
                $('body').append(tiro);
                currentSpawnedTirosPlayer.push(tiro);
                setTimeout(() => {
                    alreadyShoot = false
                }, 1000 / shootsPerSecond);
            }
        }

        function moveTiroPlayer() {
            const jogoWidth = jogo.width() + jogo.offset().left;
            if (currentSpawnedTirosPlayer.length > 0) {
                currentSpawnedTirosPlayer.map((tiro, idx) => {
                    const currentLeft = parseInt(tiro.css('left'))
                    tiro.css({
                        left: `${currentLeft + velocidadeTiro}px`
                    });
                    if (currentLeft > jogoWidth - tiro.width()) {
                        currentSpawnedTirosPlayer.splice(idx, 1)
                        tiro.remove()
                    }
                });
            }
        }



        function handleColisions() {
            handleTiroEnemyCollisions()
            handlePlayerEnemyCollisions()
        }

        function handleTiroEnemyCollisions() {
            currentSpawnedTirosPlayer.map(tiro => {
                return currentSpawnedEnemies.map(enemy => {
                    const collisions = $(tiro).collision(enemy.selector);
                    if (collisions.length > 0) {
                        enemy.vida -= 1
                        const index = currentSpawnedTirosPlayer.indexOf(tiro);
                        if (index !== -1) {
                            currentSpawnedTirosPlayer.splice(index, 1);
                        }
                        tiro.remove()
                        removeEnemyIfNoLife(enemy);
                    }
                })
            })
        }

        function handlePlayerEnemyCollisions() {
            if (isCheckingCollisions) {
                return;
            }

            isCheckingCollisions = true;

            currentSpawnedEnemies.forEach((enemy, index) => {
                const collisions = $(player).collision(enemy.selector);

                if (collisions.length > 0) {
                    enemy.vida -= 3;
                    vidaPlayer -= 25;
                    removeEnemyIfNoLife(enemy);
                    if (vidaPlayer <= 0) {
                        playerPosition = Object.assign({}, player.position());
                        player.remove();
                        const explosion = $('<div class="explosao"></div>').css({
                            top: playerPosition.top + 'px',
                            left: playerPosition.left + 'px'
                        });
                        explosion.appendTo(jogo);
                        explosion.on('animationend', () => {
                            explosion.remove();
                        });
                    }
                }
            });

            setTimeout(() => {
                isCheckingCollisions = false;
            }, 200);
        }

        function removeEnemyIfNoLife(enemy) {
            if (enemy.vida <= 0) {
                playMusic('./sons/explosao.mp3', 0.1, false, true)
                const enemyPosition = Object.assign({}, enemy.position());
                enemy.remove()
                currentSpawnedEnemies.splice(currentSpawnedEnemies.indexOf(enemy), 1);
                const explosion = $('<div class="explosao"></div>').css({
                    top: enemyPosition.top + 'px',
                    left: enemyPosition.left + 'px'
                });
                explosion.appendTo(jogo);
                explosion.on('animationend', () => {
                    explosion.remove();
                });
            }
        }

        function secondPhase() {
            controleNave()
            moveInimigo()
            moveTiroPlayer()
            handleColisions()
            updateVidaPlayerBarra()
        }

        const SecondPhaseInterval = setInterval(secondPhase, 30)
        const CriaInimigoInterval = setInterval(criaInimigo, segundosParaCriarNovosInimigos * 1000)

        intervals.push(contador)
        intervals.push(SecondPhaseInterval)
        intervals.push(CriaInimigoInterval)


        function setGameOver() {
            gameOver = true;
            intervals.forEach(interval => clearInterval(interval));
            jogo.empty();
            jogo.append("<div id='gameOver' class='gameOver'></div>");
            const gameOverScreen = $('#gameOver');
            gameOverScreen.on('click', function () {
                gameOverScreen.remove();
                startSecondPhase();
            });
            gameOverScreen.append("<h1>Game Over</h1>");
            gameOverScreen.append("<div></div>");
            const gameOverDiv = $('#gameOver div');
            gameOverDiv.append("<span>O mundo precisava de você</span>");
            gameOverDiv.append("<img src='./img/rosa.png' alt='game over'>");
        }

    }

    function startBossFight() {

        const currentSpawnedBossTiros = []

        const boss = criaBoss();
        function criaBoss() {
            const boss = $('<div id="boss" class="boss"></div>');
            return boss;
        }



        boss.appendTo(jogo);

        jogo.append("<div id='contadorSegundos' class='contadorSegundos'></div>")

        let contadorSegundos = 120;

        const contador = setInterval(() => {
            contadorSegundos--;
            var minutos = Math.floor(contadorSegundos / 60);
            var segundos = contadorSegundos % 60;
            var contadorElement = $('#contadorSegundos');
            contadorElement.html(minutos.toLocaleString('pt-BR', { minimumIntegerDigits: 2, useGrouping: false }) + ":" + segundos.toLocaleString('pt-BR', { minimumIntegerDigits: 2, useGrouping: false }));
            if (contadorSegundos <= 0) {
                clearInterval(contador);
                contadorElement.remove();
            }
            if (contadorSegundos === 0 && vidaPlayer > 0) {
                jogo.empty();
                intervals.forEach(interval => clearInterval(interval));
                jogo.append('<div class="youWin"><div>')
            }
        }, 1000);

        let oldBossPostion = Object.assign({}, $('#boss').position()).top + 4;

        function animacaoBoss() {
            const boss = $('#boss');
            const bossPosition = boss.position();
            if (bossPosition.top > 150) {
                const newTop = bossPosition.top - 4;
                boss.css('top', newTop);
                oldBossPostion = parseInt(bossPosition.top);
            } else if (bossPosition.top < 50) {
                const newTop = bossPosition.top + 4;
                boss.css('top', newTop);
                oldBossPostion = parseInt(bossPosition.top);
            } else if (bossPosition.top > oldBossPostion) {
                const newTop = bossPosition.top + 4;
                boss.css('top', newTop);
                oldBossPostion = parseInt(bossPosition.top);
            } else if (bossPosition.top < oldBossPostion) {
                const newTop = bossPosition.top - 4;
                boss.css('top', newTop);
                oldBossPostion = parseInt(bossPosition.top);
            }
        }

        const animacaoBossInterval = setInterval(animacaoBoss, 100);

        const bossAttackInterval = setInterval(() => {
            const player = $('#player');
            let randomAttack
            if (contadorSegundos > 120) {
                randomAttack = 0
            } else if (contadorSegundos > 60) {
                randomAttack = 1
            } else if (contadorSegundos > 30) {
                randomAttack = 2
            } else {
                randomAttack = Math.floor(Math.random() * 3);
            }
            if (randomAttack === 0) {
                const bossMissilId = `bossMissil_${Date.now()}`;
                jogo.append(`<div id="${bossMissilId}" class="bossMissil"></div>`);
                const bossMissil = $(`#${bossMissilId}`);
                bossMissil.css({
                    top: Math.random() * 500 - bossMissil.height(),
                    left: 800 - bossMissil.width()
                });
                bossMissil.move = () => {
                    const currentLeft = parseInt(bossMissil.css('left'));
                    if (currentLeft < 0 - bossMissil.width()) {
                        bossMissil.remove();
                        currentSpawnedBossTiros.splice(currentSpawnedBossTiros.indexOf(bossMissil), 1);
                    } else {
                        bossMissil.css({
                            left: `${currentLeft - 8}px`
                        });
                    }
                };
                currentSpawnedBossTiros.push(bossMissil);
            } else if (randomAttack === 1) {
                const bossMissilId = `bossMissil_${Date.now()}`;
                jogo.append(`<div id="${bossMissilId}" class="bossMissil"></div>`);
                const bossMissil = $(`#${bossMissilId}`);
                const bossMissilSpeed = Math.floor(Math.random() * 32)
                bossMissil.speed = bossMissilSpeed < 8 ? 8 : bossMissilSpeed;
                bossMissil.css({
                    top: Math.random() * 500 - bossMissil.height(),
                    left: 800 - bossMissil.width()
                });
                bossMissil.move = () => {
                    const currentLeft = parseInt(bossMissil.css('left'));
                    if (currentLeft < 0 - bossMissil.width()) {
                        bossMissil.remove();
                        currentSpawnedBossTiros.splice(currentSpawnedBossTiros.indexOf(bossMissil), 1);
                    } else {
                        bossMissil.css({
                            left: `${currentLeft - bossMissilSpeed}px`
                        });
                    }
                };
                currentSpawnedBossTiros.push(bossMissil);

            } else {
                if (currentSpawnedBossTiros < 4) {
                    const bossMissilId = `bossMissil_${Date.now()}`;
                    jogo.append(`<div id="${bossMissilId}" class="bossMissil"></div>`);
                    const bossMissil = $(`#${bossMissilId}`);
                    bossMissil.css({
                        top: Math.random() * 500 - bossMissil.height(),
                        left: 800 - bossMissil.width()
                    });
                    bossMissil.move = () => {
                        const currentLeft = parseInt(bossMissil.css('left'));
                        const currentTop = parseInt(bossMissil.css('top'));
                        const playerPos = player.position();
                        const targetLeft = playerPos.left + player.width() / 2 - bossMissil.width() / 2;
                        const targetTop = playerPos.top + player.height() / 2 - bossMissil.height() / 2;
                        const deltaX = targetLeft - currentLeft;
                        const deltaY = targetTop - currentTop;
                        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        const speed = 8;
                        const velocityX = (deltaX / distance) * speed;
                        const velocityY = (deltaY / distance) * speed;
                        if (Math.abs(currentLeft - targetLeft) < Math.abs(velocityX) && Math.abs(currentTop - targetTop) < Math.abs(velocityY)) {
                            bossMissil.css({
                                left: `${targetLeft}px`,
                                top: `${targetTop}px`,
                                transform: `rotate(${Math.atan2(velocityY, velocityX) * (180 / Math.PI)}deg)`
                            });
                        } else {
                            bossMissil.css({
                                left: `${currentLeft + velocityX}px`,
                                top: `${currentTop + velocityY}px`,
                                transform: `rotate(${Math.atan2(velocityY, velocityX) * (180 / Math.PI)}deg)`
                            });
                        }
                    };
                    bossMissil.move();
                    currentSpawnedBossTiros.push(bossMissil);


                    const tempoLimite = setTimeout(() => {
                        const bossMissilPos = Object.assign({}, bossMissil.position());
                        currentSpawnedBossTiros.splice(currentSpawnedBossTiros.indexOf(bossMissil), 1);
                        playMusic('./sons/explosao.mp3', 0.1, false, true)
                        bossMissil.remove();
                        const explosionId = Date.now()
                        const explosion = $(`<div class="explosao" id="${explosionId}"></div>`).css({
                            top: bossMissilPos.top + 'px',
                            left: bossMissilPos.left + 'px'
                        });
                        explosion.appendTo(jogo);
                        explosion.on('animationend', () => {
                            explosion.remove();
                        });
                    }, 4000);


                    bossMissil.removeTempoLimite = () => {
                        clearTimeout(tempoLimite);
                    }
                }
            }
        }, 1000);

        const movimentaTirosBoss = setInterval(() => {
            const currentSpawnedBossTirosFreezed = [...currentSpawnedBossTiros];
            currentSpawnedBossTirosFreezed.forEach(tiro => {
                tiro.move();
            });
        }, 30);


        function handleBossTiroPlayerCollisions() {
            const player = $('#player');
            currentSpawnedBossTiros.forEach(tiro => {
                const collisions = $(tiro).collision(player);
                if (collisions.length > 0) {
                    playMusic('./sons/explosao.mp3', 0.1, false, true)
                    tiro.removeTempoLimite();
                    tiro.remove();
                    currentSpawnedBossTiros.splice(currentSpawnedBossTiros.indexOf(tiro), 1);
                    vidaPlayer -= 10;
                }
            });
        }

        const handleBossTiroPlayerCollisionsInterval = setInterval(handleBossTiroPlayerCollisions, 30);

        intervals.push(animacaoBossInterval)
        intervals.push(bossAttackInterval)
        intervals.push(movimentaTirosBoss)
        intervals.push(handleBossTiroPlayerCollisionsInterval)

    }
}