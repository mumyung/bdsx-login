import { events } from "bdsx/event";

events.serverOpen.on(() => {
    import ("./login")
    console.log("login loaded")
})
