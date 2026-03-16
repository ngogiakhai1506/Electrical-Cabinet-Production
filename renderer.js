console.log("Renderer script loaded")

const webview = document.getElementById("baseWeb")

function wait(ms){
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForColumn(){

  while(true){

    const exists = await webview.executeJavaScript(`
      document.getElementById("stage-88605") !== null
    `)

    if(exists){
      console.log("Column detected")
      return
    }

    console.log("Waiting for workflow column...")
    await wait(2000)

  }

}

async function extractTasks(){

  console.log("Starting extraction...")

  const results = await webview.executeJavaScript(`

    (() => {

      const stage = document.getElementById("stage-88605")

      if(!stage){
        return []
      }

      const tasks = []

      const cards = stage.querySelectorAll(".item")

      cards.forEach(card => {

        const taskId = card.getAttribute("data-id")
        const title = card.getAttribute("title")

        if(taskId && title){

          tasks.push({
            project_name: title.trim(),
            task_id: taskId
          })

        }

      })

      return tasks

    })()

  `)

  console.log("Extracted tasks:", results)

  if(results && results.length > 0){
    window.electronAPI.saveResults(results)
  }

}

webview.addEventListener("did-finish-load", async () => {

  console.log("Page finished loading")

  await waitForColumn()

  extractTasks()

  setInterval(() => {

    console.log("Running scheduled extraction...")
    extractTasks()

  }, 600000)

})