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
import { ServerSettingsRequestPacket } from "bdsx/bds/packets"
import { CommandPermissionLevel } from "bdsx/bds/command";
import { CANCEL } from "bdsx/common"

events.packetAfter(MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {
    loginmenu(networkIdentifier);
})
command.register("login", "로그인을 합니다.", CommandPermissionLevel.Normal).overload(async (p, o, op) => {
    let ni = o.getEntity()?.getNetworkIdentifier();
    loginmenu(ni);
}, {});

command.register("로그인", "로그인을 합니다.", CommandPermissionLevel.Normal).overload(async (p, o, op) => {
    let ni = o.getEntity()?.getNetworkIdentifier();
    loginmenu(ni);
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


async function logins(ni: NetworkIdentifier) {
    const res = await Form.sendTo(ni, {
        type: "custom_form",
        title: "§l§d로그인 창",
        content: [
            {
                type: "input",
                text: "밑에 당신의 닉네임을 써주세요."
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
        if (name != "") {
            if (password != "") {
                const UserJSON = `../plugins/login/User/${name}.json`
                if (fs.readFileSync(UserJSON, 'utf8')) {
                    const read = JSON.parse(fs.readFileSync(UserJSON, "utf8"))
                    if (read.password == password) {
                        bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§a닉네임 : ${name}\n비밀번호 : ${password} 로 로그인했습니다.}"}]}`)
                        bedrockServer.executeCommand(`tag "${ni.getActor()?.getName()}" add login`)
                    } else {
                        bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c비밀번호가 다릅니다!"}]}`)
                    }
                } else {
                    bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c${name}에 대한 정보가 없습니다!"}]}`)
                }
            } else {
                bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c비밀번호를 적어주세요!"}]}`)
            }
        } else {
            bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c닉네임을 적어주세요!"}]}`)
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
                text: "밑에 닉네임을 써주세요."
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
                if (password1 == password) {
                    const UserJSON = `../plugins/login/User/${name}.json`

                    !fs.existsSync(UserJSON) ? fs.writeFileSync(UserJSON, JSON.stringify({})) : null;

                    let Save = {};
                    Save = { name, password, deviceId: ni.getActor()?.deviceId, playerName: ni.getActor()?.getName() }
                    fs.writeFileSync(UserJSON, JSON.stringify(Save))
                    bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§a당신의 닉네임 : ${name}\n당신의 비밀번호 : ${password} 로 저장되었습니다."}]}`)
                    bedrockServer.executeCommand(`tag "${ni.getActor()?.getName()}" add signup`)
                } else {
                    bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c비밀번호가 다릅니다!"}]}`)
                }
            } else {
                bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c비밀번호를 적어주세요!"}]}`)
            }
        } else {
            bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"§c닉네임을 적어주세요!"}]}`)
        }
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
            }
        ]
    })
    if (res === null) return;
    const login = res;
    if (login) {
        signup(ni);
    } else {
        logins(ni);
    }
}
