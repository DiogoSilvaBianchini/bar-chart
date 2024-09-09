const canvas = document.querySelector("#graph")
const ctx = canvas.getContext("2d")

let data = [
    {title: "Jan", height: 0, targetHeight: 1},
    {title: "Jan", height: 0, targetHeight: 5},
    {title: "Fav", height: 0, targetHeight: 10},
    {title: "Fav", height: 0, targetHeight: 15},
    {title: "Fav", height: 0, targetHeight: 20},
]

let legends = document.querySelector("#legends")
let goalCheckBox = document.querySelector("#goal")
let offBars = document.querySelector("#offBars")

let legendsToggle = true
let goalToggle = true
let barsToggle = true

let blockButtons = () => {
    legends.disabled = true
    goalCheckBox.disabled = true
}

let enableButtons = () => {
    legends.disabled = false
    goalCheckBox.disabled = false
}


legends.addEventListener("change", (e) => {
    let checked = e.target.checked
    checked ? legendsToggle = true : legendsToggle = false
    drawGraph()
})

goalCheckBox.addEventListener("change", (e) => {
    let checked = e.target.checked
    checked ? goalToggle = true : goalToggle = false
    drawGraph()
})

offBars.addEventListener("change", (e) => {
    let checked = e.target.checked
    blockButtons()
    if(checked){
        barsToggle = true
        legendsToggle = legends.checked
    }else{
        barsToggle = false
        legendsToggle = false
    }
    drawGraph()
})

const getMaxValue = () => {
    const targetValues = data.map(values => {
        return values.targetHeight
    })
    
    const maxValue = Math.max(...targetValues)
    const maxValueIndex = targetValues.indexOf(maxValue)

    return {maxValue, maxValueIndex}
}

const addLegendBar = (barWidth, barSpacing, fontSize) => {
    let font = fontSize
    let fontSpacingBar = 3
    let fontColor = "#000"

    data.map((value, i) => {
        let posX = i * (barWidth + barSpacing) + barSpacing
        let posY = canvas.height - value.height

        ctx.fillStyle = fontColor
        ctx.font = `${font}px inter`

        let textValue = value.targetHeight.toFixed(2)

        let widthText = ctx.measureText(textValue).width
        let centralizeText = (barWidth - widthText) / 2 + posX

        ctx.fillText(textValue, centralizeText, posY - fontSpacingBar)
    })
}

let frameAnimation

const drawBars = (scale, goal, barWidth, barSpacing, controll) => {
    let speedAnimation = 2
    let colorBar = "#2a9d8f"
    let goalWarnign = "#fca311"
    let goalFailureColor = "#d62828"

    data.map((value, i) => {
        let posX = i * (barWidth + barSpacing) + barSpacing
        let posY = canvas.height - value.height

        if(controll){
            if(value.height < value.targetHeight / scale){
                value.height += speedAnimation
            }
        }else{
            if(value.height > 0){
                value.height -= speedAnimation
            }
        }

        if(value.targetHeight < goal){
            ctx.fillStyle = goalFailureColor
        }else if(value.targetHeight == goal){
            ctx.fillStyle = goalWarnign
        }else{
            ctx.fillStyle = colorBar
        }

        if(!controll){
            posY += speedAnimation
        }

        ctx.fillRect(posX, posY, barWidth, value.height)
    })
}

const addGoalLine = (goal, scale) => {
    let goalText = goal.toFixed(2)
    let textWidth = ctx.measureText(goalText).width
    
    let goalScala = canvas.height - (goal / scale)
    let colorGoal = "#999"

    ctx.strokeStyle = colorGoal
    ctx.fillStyle = colorGoal

    ctx.fillText(goalText, canvas.width - textWidth - 8, goalScala - 4)
    
    ctx.moveTo(0, goalScala)
    ctx.lineTo(canvas.width, goalScala)
    ctx.stroke()
}

const drawGraph = () => {
    let {maxValue, maxValueIndex} = getMaxValue()
    let biggestBarHeight = data[maxValueIndex].targetHeight
    let curretHeightLastBar = data[maxValueIndex].height
    let canvasHeight = canvas.height
    let canvasWidth = canvas.width

    let scale = 1
    let goal = 10
    let fontSize = 14

    let barWidth = 40
    let barSpacing = 16
    let minCanvasWidth = 500

    let resizingCanvas = (data.length * barWidth) + (barSpacing * data.length + barSpacing)

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    
    resizingCanvas < minCanvasWidth ? resizingCanvas = minCanvasWidth : canvas.width = resizingCanvas

    maxValue > canvasHeight ? scale = (maxValue / canvasHeight) * 1.1:null
    
    drawBars(scale, goal, barWidth, barSpacing, barsToggle)
    goalToggle && addGoalLine(goal, scale)
    legendsToggle && addLegendBar(barWidth, barSpacing, fontSize)   
    drawSubTitles(barWidth, barSpacing, fontSize)

    frameAnimation = requestAnimationFrame(drawGraph)   
   
    if(barsToggle){
        if(curretHeightLastBar >= biggestBarHeight / scale){
            cancelAnimationFrame(frameAnimation)
            if(legends.disabled == true){
                enableButtons()
            }
        }
    }else{
        if(curretHeightLastBar == 0){
            cancelAnimationFrame(frameAnimation)
            if(legends.disabled == true){
                enableButtons()
            }
        }
    }
}

const drawSubTitles = (barWidth, barSpacing, fontSize) => {
    const canvasSubTitles = document.querySelector("#subTitles")
    const ctxSubTitles = canvasSubTitles.getContext("2d")

    canvasSubTitles.width = canvas.width
    ctxSubTitles.font = `${fontSize}px Inter`
    
    data.map((value, i) => {
        let textWidth = ctxSubTitles.measureText(value.title).width
        
        let posX = i * (barWidth + barSpacing) + barSpacing
        let centerText = (barWidth - textWidth) / 2 + posX

        ctxSubTitles.fillText(value.title, centerText, 14)
    })
}