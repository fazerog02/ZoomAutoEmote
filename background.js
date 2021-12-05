const SERVER_URL = "./my_model/"


async function init() {
    Object.defineProperty(window, "expression", {
        value: "neutral",
        writable: true
    })

    const modelURL = SERVER_URL + "model.json"
    const metadataURL = SERVER_URL + "metadata.json"
    Object.defineProperty(window, "prediction_model", {
        value: await tmImage.load(modelURL, metadataURL)
    })
    Object.defineProperty(window, "num_of_classes", {
        value: model.getTotalClasses()
    })

    const flip = true
    Object.defineProperty(window, "webcam", {
        value: new tmImage.Webcam(200, 200, flip)
    })
    await window.webcam.setup()
    await window.webcam.play()
    window.requestAnimationFrame(loop)
}


async function loop() {
    window.webcam.update()
    await predict()
    window.requestAnimationFrame(loop)
}


function changeEmote() {
    if(window.expression === undefined) return
    let tooltip_name
    switch(window.expression) {
        case "smile": {
            tooltip_name = "ヨロコビ"
            break
        }
        case "oops": {
            tooltip_name = "開いた口"
            break
        }
        case "good": {
            tooltip_name = "賛成"
            break
        }
        default: {
            return
        }
    }

    document.querySelector("[aria-label=リアクション]").click()
    document.querySelector(`data-tooltip=${tooltip_name}`).click()
}


async function predict() {
    const predictions = await window.model.predict(window.webcam.canvas);
    let max_probability = -1
    let max_probability_class_name = null
    for (let i = 0; i < window.num_of_classes; i++) {
        if(max_probability < predictions[i].probability){
            max_probability = predictions[i].probability
            max_probability_class_name = predictions[i].className
        }
    }

    if(max_probability_class_name === null) return
    if(window.expression === max_probability_class_name) return

    window.expression = max_probability_class_name
    changeEmote()
}


chrome.action.onClicked.addListener(async (tab) => {
	chrome.tabs.executeScript({
		target: { tabId: tab.id },
		function: async () => await init()
	})
})
