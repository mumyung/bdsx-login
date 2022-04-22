// Helper: mono
// made by mumyung
// omlet nick: mumyung1507 (https://omlet.gg/profile/mumyung1507)
// open kakao: (https://open.kakao.com/o/sA0YzEid)

// 도와 준 사람 : 모노
// 만든 사람: 무명(mumyung)
// 옴렛 닉: mumyung1507 (https://omlet.gg/profile/mumyung1507)
// 1대1 오픈 카톡방: (https://open.kakao.com/o/sA0YzEid)

import { events } from "bdsx/event"
import { NetworkIdentifier } from "bdsx/bds/networkidentifier"
import { Form } from "bdsx/bds/form"
import * as fs from "fs"
import { bedrockServer } from "bdsx/launcher"
import { command } from "bdsx/command"
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CommandPermissionLevel } from "bdsx/bds/command";
import { CANCEL } from "bdsx/common"

events.packetAfter(MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {
    loginmenu(networkIdentifier);
})
command.register("login", "로그인을 합니다.", CommandPermissionLevel.Normal).overload(async (p, o, op) => {
    const player = o.getEntity();
    if (player?.isPlayer()) {
        let ni = player.getNetworkIdentifier()
        loginmenu(ni);
    }
}, {});

command.register("로그인", "로그인을 합니다.", CommandPermissionLevel.Normal).overload(async (p, o, op) => {
    const player = o.getEntity();
    if (player?.isPlayer()) {
        let ni = player.getNetworkIdentifier()
        loginmenu(ni);
    }
}, {});


events.packetBefore(MinecraftPacketIds.Text).on((ptr, ni, id) => {
    if (ni.getActor()?.hasTag(`login`)) {

    } else {
        bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c로그인 후 채팅을 치세요!"}]}`)
        return CANCEL
    }
})

events.playerJoin.on((ev) => {
    loginmenu(ev.player.getNetworkIdentifier());
})

events.playerJoin.on((ev) => {
    bedrockServer.executeCommand(`tag "${ev.player.getName()}" remove login`);
})

events.packetAfter(MinecraftPacketIds.MovePlayer).on((ev, ni) => {
    if (ni.getActor()?.hasTag(`login`)) {

    } else {
        const x = ev.pos.x
        const y = ev.pos.y - 1
        const z = ev.pos.z
        const xtp = Math.floor(x)
        const ytp = Math.floor(y)
        const ztp = Math.floor(z);

        bedrockServer.executeCommand(`tp "${ni.getActor()!.getName()}" ${xtp} ${ytp} ${ztp}`)
        bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c로그인을 해야 움직일 수 있습니다!"}]}`)
    }})

events.playerAttack.on((ev) => {
    const player = ev.player
    let ni = player.getNetworkIdentifier()
    if (ni.getActor()?.hasTag(`login`)) {

    } else {
        bedrockServer.executeCommand(`tellraw "${player.getName()}" {"rawtext":[{"text":"§c로그인을 안하면 엔티티를 때릴 수 없습니다"}]}`)
        return CANCEL;
    }
})

async function logins(ni: NetworkIdentifier) {
    const res = await Form.sendTo(ni, {
        type: "custom_form",
        title: "§l§d로그인 창",
        content: [
            {
                type: "input",
                text: "밑에 당신의 아이디를 써주세요."
            },
            {
                type: "input",
                text: "밑에 비밀번호를 적어주세요."
            }
        ]
    })
    if (res === null) return;
    const name = res[0];
    const password = res[1];
    if (ni.getActor()?.hasTag(`login`)) {
        bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c당신은 이미 로그인을 했습니다!"}]}`)
    } else {
        if (ni.getActor()?.hasTag(`signup`)) {
            if (name != "") {
                if (password != "") {
                    const UserJSON = `../plugins/login/User/${name}.json`
                    !fs.existsSync(UserJSON) ? fs.writeFileSync(UserJSON, JSON.stringify({})) : null;
                    const read = JSON.parse(fs.readFileSync(UserJSON, "utf8"))
                    console.log(read.playerName)
                    if (read.playerName == undefined) {
                        fs.unlinkSync(UserJSON);
                        bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c${name}에 대한 정보가 없습니다!"}]}`)
                    } else {
                        if (read.password == password) {
                            bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§a아이디 : ${name}\n비밀번호 : ${password}로 로그인했습니다."}]}`)
                            bedrockServer.executeCommand(`tag "${ni.getActor()?.getName()}" add login`)
                        } else {
                            bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c비밀번호가 일치하지 않습니다!"}]}`)
                        }
                    }
                } else {
                    bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c비밀번호를 적어주세요!"}]}`)
                }
            } else {
                bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c아이디를 적어주세요!"}]}`)
            }
        } else {
            bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c회원가입 후 시도해주세요!"}]}`)
        }
    }
}

async function signup(ni: NetworkIdentifier) {
    const res = await Form.sendTo(ni, {
        type: "custom_form",
        title: "§l§d회원가입 창",
        content: [
            {
                type: "input",
                text: "밑에 아이디를 써주세요."
            },
            {
                type: "input",
                text: "밑에 비밀번호를 적어주세요."
            },
            {
                type: "input",
                text: "비밀 번호를 확인 하기 위에 위에 썼던 비밀 번호를 써주세요."
            }
        ]
    })
    if (res === null) return;
    const name = res[0];
    const password = res[1];
    const password1 = res[2];
    if (ni.getActor()?.hasTag(`signup`)) {
        bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c당신은 이미 회원가입을 했습니다!"}]}`)
    } else {
        if (name != "") {
            if (password != "") {
                const UserJSON = `../plugins/login/User/${name}.json`
                !fs.existsSync(UserJSON) ? fs.writeFileSync(UserJSON, JSON.stringify({})) : null;
                const read = JSON.parse(fs.readFileSync(UserJSON, "utf8"))
                if (read.playerName) {
                    bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c${name}은 이미 저장되어있습니다!"}]}`)
                } else {
                    if (read.playerName === undefined) {
                        fs.unlinkSync(UserJSON);
                        if (password1 == password) {
                            const UserJSON = `../plugins/login/User/${name}.json`

                            !fs.existsSync(UserJSON) ? fs.writeFileSync(UserJSON, JSON.stringify({})) : null;

                            let Save = {};
                            Save = { name, password, deviceId: ni.getActor()?.deviceId, playerName: ni.getActor()?.getName() }
                            fs.writeFileSync(UserJSON, JSON.stringify(Save))
                            bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§a당신의 아이디 : ${name}\n당신의 비밀번호 : ${password}로 저장되었습니다."}]}`)
                            bedrockServer.executeCommand(`tag "${ni.getActor()?.getName()}" add signup`)
                        } else {
                            bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c비밀번호가 일치하지 않습니다!"}]}`)
                        }
                    }
                }
            } else {
                bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c비밀번호를 적어주세요!"}]}`)
            }
        } else {
            bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c아이디를 적어주세요!"}]}`)
        }
    }
}
async function Deleteaccount(ni: NetworkIdentifier) {
    const res = await Form.sendTo(ni, {
        type: "custom_form",
        title: "§l§b계정 삭제 창",
        content: [
            {
                type: "input",
                text: "밑에 당신의 아이디를 써주세요",
            },
            {
                type: "input",
                text: "비번을 입력해 주세요!"
            }
        ]
    })
    if (res === null) return;

    const name = res[0];
    const psw = res[1];

    if (ni.getActor()?.hasTag(`signup`)) {
        if (ni.getActor()?.hasTag(`login`)) {
            if (name != "") {
                if (psw != "") {
                    const UserJSON = `../plugins/login/User/${name}.json`
                    !fs.existsSync(UserJSON) ? fs.writeFileSync(UserJSON, JSON.stringify({})) : null;
                    const read = JSON.parse(fs.readFileSync(UserJSON, "utf8"))
                    if (read.playerName === undefined) {
                        fs.unlinkSync(UserJSON);
                        bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c${name}에 대한 정보가 없습니다!"}]}`)
                    } else {
                        if (psw == read.password) {
                            if (ni.getActor()?.deviceId == read.deviceId) {
                                fs.unlinkSync(UserJSON);
                                bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§a계정이 삭제 되었습니다!"}]}`)
                                bedrockServer.executeCommand(`tag "${ni.getActor()!.getName()}" remove signup`)
                                bedrockServer.executeCommand(`tag "${ni.getActor()!.getName()}" remove login`)
                            } else {
                                bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c당신은 해당 계정주인이 아닙니다!"}]}`)
                            }
                        } else {
                            bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c비밀번호가 일치하지 않습니다!"}]}`)
                        }
                    }
                } else {
                    bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c비밀번호를 적어주세요!"}]}`)
                }
            } else {
                bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c아이디를 적어주세요!"}]}`)
            }
        } else {
            bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c로그인 후 시도해주세요!"}]}`)
        }
    } else {
        bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c회원가입 후 시도해주세요!"}]}`)
    }
}

async function passwordfind(ni: NetworkIdentifier) {
    const res = await Form.sendTo(ni, {
        type: "custom_form",
        title: "§l§e비번 찾기",
        content: [
            {
                type: "input",
                text: "당신의 아이디를 써주세요!"
            },
        ]
    })
    if (res === null) return;

    const name = res[0];

    if (ni.getActor()?.hasTag(`signup`)) {
        if (name != "") {
            const UserJSON = `../plugins/login/User/${name}.json`
            !fs.existsSync(UserJSON) ? fs.writeFileSync(UserJSON, JSON.stringify({})) : null;
            const read = JSON.parse(fs.readFileSync(UserJSON, "utf8"))
            if (ni.getActor()?.deviceId == read.deviceId) {
                if (read.playerName === undefined) {
                    bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c${name}에 대한 정보가 없습니다!"}]}`)
                    fs.unlinkSync(UserJSON)
                } else {
                    bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§a비밀번호: ${read.password}입니다."}]}`)
                }
            } else {
                bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c닉네임을 적어주세요!"}]}`)
            }
        } else {
            bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§cError code 0x00000001"}]}`)
        }
    } else {
        bedrockServer.executeCommand(`tellraw "${ni.getActor()!.getName()}" {"rawtext":[{"text":"§c계정의 주인이 당신이 아닙니다."}]}`)
    }
}

async function loginmenu(ni: NetworkIdentifier) {
    const res = await Form.sendTo(ni, {
        type: "form",
        title: "§l로그인",
        content: "",
        buttons: [
            {
                text: "§l§a로그인"
            },
            {
                text: "§l§c회원가입"
            },
            {
                text: "§l§d계정삭제"
            },
            {
                text: "§e§l비번찾기"
            }
        ]
    })
    if (res === null) return;

    const login = res;
    console.log(login)
    if (login == 0) {
        logins(ni);
    } else if (login == 1) {
        signup(ni);
    } else if (login == 2) {
        Deleteaccount(ni)
    } else if (login == 3) {
        passwordfind(ni)
    }
}
