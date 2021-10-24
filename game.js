kaboom({
    global: true,
    fullscreen: true,
    scale: 1.5,
    debug: true,
    clearColor: [0, 0, 0, 1],
})

    const moveSpeed = 120;
    const jumpForce = 385;
    const shroomSpeed = 30;
    let isJumping = true;
    const fallDeath = 400;

loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('block', 'M6rwarW.png') 
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-block', 'fVscIbn.png') 
loadSprite('blue-evil-shroom', 'SvV4ueD.png')



scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
    [
        '                                                ',
        '                                                ',
        '                    >>>>>>>>                    ',
        '                                 $$$$$$         ',
        '                                 >>>>>>         ',
        '      %  >*>>*>>>                               ',
        '                                                ',
        '                                              -+',
        '                 ^    ^              ^        ()',
        '============================   =================',
    ],
    [   
        '&                                              &',
        '&                                              &',
        '&         $$$$ $$$$$                           &',
        '&         &&&& &&&&&  &&&&&&                   &',
        '&                              &&&&&&          &',
        '&                              & $$$$          &',
        '&     @                        & $$$$ &        &',
        '&    @@@                       & $$$$ &      -+&',
        '&   @@@@@            ~ ~       & $$$$ &      ()&',
        '!!!!!!!!!!!!   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ],
    [   '                                                ',                            
        '                          %  %                  ',
        '     >%> >*>                                    ',
        '                                                ',
        '                     >>  >  >  >>>>             ',
        '                    >>                          ',
        '     >%> >%>       >>>                    >     ',
        '                  >>>>                  > >     ',
        '                 >>>>>                > > >   -+',
        '                >>>>>>     ^      ^ > > > >   ()',
        '======================  =====  =================',
    ],
    ];

    const levelCfg = {
        width: 20, 
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '>': [sprite('brick'), solid(), 'wall'],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite('evil-shroom'), solid(), 'dangerous', body()],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '@': [sprite('blue-steel'), solid(), scale(0.5)],
        '&': [sprite('blue-brick'), solid(), scale(0.5)],
        '~': [sprite('blue-evil-shroom'), solid(), scale(0.5), body(), 'dangerous'],
        //'/': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],

    }

    const gameLevel = addLevel(maps[level], levelCfg)

    const scoreLabel = add([
        text(score),
        pos(30, 6),
        layer('ui'), 
        {
            value: score,
        }
    ])

    add([text('WORLD 1-' + parseInt(level + 1)), pos(400, 6)]);

    function big() {
        let isBig = false;
        return {
            isBig() {
                return isBig;
            },
            smallify() {
                this.scale = vec2(1)
                isBig = false;
            },
            biggify() {
                this.scale = vec2(1.5);
                isBig = true;
            }
        }
    }

    const player = add([
        sprite('mario'), solid(), 
        pos(30, 0), 
        body(),
        big(),
        origin('bot'),
    ])

    const evil = add([
        sprite('evil-shroom'), solid(),
        body(),
        pos('default'),
        origin('bot') 
    ])

    action('mushroom', (m) => {
        m.move(shroomSpeed, 0)
    })

    player.on("headbump", (obj) => {
        if(obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0,1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0,0))
        }
        if(obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0,1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0,0))
        }
    })

    player.collides('mushroom', (m) => {
        destroy(m);
        player.biggify(6);
    })

    player.collides('coin', (c) => {
        destroy(c);
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value;
    })

    evil.collides('block', (e) => {
        e.move(shroomSpeed, 0)
    }) 
    
    action('dangerous', (d) => {
        d.move(-shroomSpeed, 0)  
    })
    

    player.collides('dangerous', (d) => {
        if(isJumping) {
            destroy(d)
        }
        else if(player.isBig()) {
            player.smallify();
        } else {
            go('lose', { score: scoreLabel.value})
        }
        
    })

    player.action(() => {
        //camPos(player.pos)
        if(player.pos.y >= fallDeath) {
            go('lose', { score: scoreLabel.value })
        }
    })

    player.collides('pipe', () => {
        let stayBig = false;
        keyPress('down', () => {
            if(player.isBig()) {
                stayBig = player.biggify()
            }

            go('game', {
                level: (level + 1) % maps.length,
                score: scoreLabel.value,
            })
           
           
            
        })
    })

    keyDown('left', () => {
        player.move(-moveSpeed, 0)
    })
    keyDown('right', () => {
        player.move(moveSpeed, 0)
    })

    player.action(() => {
        if(player.grounded()) {
            isJumping = false;
        }
    })

    keyPress('space', () => {
        if(player.grounded()) {
            isJumping = true;
            player.jump(jumpForce)
        }
    })
})

scene('lose', ({ score }) => {
    add([text('Mario', 32), origin('topleft'), pos(5, 0)]);
    add([text(score, 32), origin('topleft'), pos(0, 35)]);
    add([text('Game Over', 36), origin('center'), pos(width() / 2, height() / 2)]);
    add([text('Refresh to Play Again :)', 18), origin('center'), pos(width() / 2, (height() / 2) + 40 )]);
})

start("game", {level: 0, score: 0})


