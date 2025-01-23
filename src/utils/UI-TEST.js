window.addEventListener('focus', e => { this.emit("page-focus") })
window.addEventListener('blur', e => { this.emit("page-blur") })
window.addEventListener('pageshow', e => { this.emit("page-show") })
window.addEventListener('pagehide', e => { this.emit("page-hide") })



window.app = {
    freeze: false,
    currentData: [],
    filterView: null,
    selection: [],
    lock: true,
    dataFilter: {
        hasSort: false,
        sort: "",
        hasWorkflow: false,
        workflow: "",
        hasTask: false,
        task: [],
        hasState: false,
        state: []
    },

    tabs: [],
    waitSignals: {},
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


window.closeWindow = name => {
    window.app.tabs = window.app.tabs || []
    _.remove(window.app.tabs, t => t.name == name)
}


window.app.signal = name => new Promise(resolve => {
    window.app.waitSignals[name] = resolve
})

window.app.resolveSignal = (name, value) => {
    console.log("resolve Signal", name, window.app.waitSignals[name], _.isFunction(window.app.waitSignals[name]))
    if (window.app.waitSignals[name] && _.isFunction(window.app.waitSignals[name])) window.app.waitSignals[name](value)
}


window.sendSignal = name => {
    console.log("send signal", name)
    window.app.resolveSignal(name)
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const activateDialog = (dialog, d, m) => dialog.showAndWait(d || { data: {} }, m || { override: "opts.data" })

const errorWidget = selectWidgets("lik2w27zhm")

const showError = error => {
    `
    <div  class="error--text my-5">
        <div class="display-1 pb-3">
            <center>
                Examination Medical Docs
            </center>
        </div>
        <div class="title pb-3">
            <center>
                <i class="mdi mdi-alert-outline pr-2"></i>Incorrect usage
            </center>
        </div>
        <div class="subtitle-2 font-weight-light">
            <center>
                ${error}
            </center>
        </div>
    </div>
    `
    setTimeout(() => {
        errorWidget.expand()
        errorWidget.show()
        errorWidget.update({ data })
    })
}

window.app.showEndMessage = message => {
    const data =
        `
    <div  class="success--text my-5">
        <div class="display-1 pb-3">
            <center>
                Heart Harvest 1 Labeling Form
            </center>
        </div>
        <div class="subtitle-2 font-weight-light">
            <center>
                ${message}
            </center>
        </div>
    </div>
    `

    this.emit("collapse-all", { ignore: ["e71cdzr3x2"] })

    setTimeout(() => {
        errorWidget.expand()
        errorWidget.show()
        errorWidget.update({ data })
    })
}

const bootstrap = async () => {


    ////////////////////////////////////////////////////////////////////////////////////////

    const scripts = {
        GET_GRANTS: "./api/controller/ade-grants/get-grants/",
        GET_ACTIVE_TASK: "./api/controller/task-dashboard/employee-task/",
        GET_METADATA: "./api/controller/task-dashboard/metadata/"
    }

    const getScript = name => scripts[name]

    const runRemote = async (url, data) => {
        let res = await axios({
            method: "POST",
            url,
            data
        })
        return res
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    const showTableLoading = () => {
        setTimeout(() => {
            selectWidgets("3qtce5ji2p6").getInstance().options.decoration.loading = true
        }, 10)
    }

    const hideTableLoading = () => {
        setTimeout(() => {
            selectWidgets("3qtce5ji2p6").getInstance().options.decoration.loading = false
        }, 10)
    }

    const showInTable = data => {
        setTimeout(() => {
            data = _.extend(data, { selection: window.app.dataSelection })
            selectWidgets("3qtce5ji2p6").update({ data }, { override: "options.data" })
        }, 10)
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const applyDataFilter = collection => {

        const state2type = states => states.map(s => {
            if (s == "New task") return "start"
            if (s == "In progress") return "save"
            if (s == "Submitted") return "submit"

        })

        collection = collection.map(d => _.extend({}, d))

        let filter = window.app.dataFilter

        if (filter.hasWorkflow && filter.workflow.length > 0) {
            collection = collection.filter(d => filter.workflow.includes(d.description.workflowType))
        }

        if (filter.hasTask && filter.task.length > 0) {
            collection = collection.filter(d => filter.task.includes(d.description.taskType))
        }

        if (filter.hasState && filter.state.length > 0) {
            collection = collection.filter(d => state2type(filter.state).includes(d.description.taskState))
        }

        if (filter.hasSort && filter.sort) {
            collection = _.sortBy(collection, d => d.createdAt)
            if (filter.sort == "time: (last added)") {
                collection.reverse()
            }
        }

        return collection
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    const updateTable = () => {

        const color = {
            start: "#FF5722",
            save: "#FF9800",
            submit: "#689F38"
        }

        const icon = {
            start: "mdi-source-commit-start",
            save: "mdi-source-commit",
            submit: "mdi-source-commit-end"
        }

        const label = {
            start: "New task",
            save: "In progress",
            submit: "Submitted"
        }

        const getExaminationViewUrl = d => `./design/ADE-PATIENT-VIEW?`

        const rowTemplate = {
            "No.": (d, index) => index + 1,
            "Workflow": d => d.description.workflowType,
            "Task": d => ({ html: `<div class="subtitle-2" style="line-height: 1;">${d.description.taskType} (${_.last(d.description.taskId.split("-"))})</div>` }),
            "History": d => ({
                component: {
                    "type": "iconButton",
                    "data": {
                        event: "show-history",
                        sourceKey: d.key
                    },
                    "decoration": {
                        "icon": "mdi-source-branch",
                        "size": 32,
                    }
                }
            }),

            "Comment": d => ({ html: `<div class="caption py-2" style="line-height: 1; width: 15rem;">${d.metadata.comment || ""}</div>` }),

            "State": d => ({
                html: `
                    <div class="caption font-weight-bold" style="line-height: 1; color:${color[d.description.taskState]}">${label[d.description.taskState]}<div>`
            }),

            "Updated at": d => {
                html: `<div class="caption" style="line-height: 1;">${moment(d.updatedAt).format("DD MMM, YY HH:mm:ss")}</div>`
            }
        }

        let collection = applyDataFilter(window.app.currentData.taskList)

        collection = collection.map((d, index) => {

            _.keys(rowTemplate).forEach(key => {
                d[key] = rowTemplate[key](d, index)
            })

            return d
        })


        let header = [
            "No.",
            "Workflow",
            "Task",
            "State",
            "History",
            "Comment",
            "Updated at"
        ]

        showInTable({
            header,
            collection
        })

        setTimeout(() => {
            selectWidgets("muct5l3o3h").update({ data: window.app }, { override: "options.data" })
        })

    }

    this.on({
        event: "freeze",
        callback: () => {
            window.app.freeze = !window.app.freeze
            updateTable()
        }
    })

    const loadMetadata = async () => {
        let response = await runRemote(getScript("GET_METADATA"), {})
        return response.data
    }

    const loadData = async () => {

        showTableLoading()

        let options = window.app.options
        let response = await runRemote(getScript("GET_ACTIVE_TASK"), { options: { user: { namedAs: user.altname } } })
        window.app.currentData = response.data
        updateTable()

        hideTableLoading()

    }

    const loadGrants = async () => {
        let options = window.app.options
        let response = await runRemote(getScript("GET_GRANTS"), { options: _.extend({}, window.app.config, { user }) })
        if (response.error) return
        if (response.data && !response.data.length) return
        return response.data[0]
    }

    window.app.getStatChart = () => {
        console.log("getStatChart", app.currentData.statistics)
        
        const color = {
            start: "#FF5722",
            save: "#FF9800",
            submit: "#689F38"
        }

        let data = applyDataFilter(window.app.currentData.taskList)

        let statistics = _.groupBy(data, t => t.description.taskState)

        _.keys(statistics).forEach(key => {
            statistics[key] = statistics[key].length
        })

        let chart = {
            title: {
                text: `${_.sum(_.keys(statistics).map(k => statistics[k]))}`,
                left: "center",
                top: "62%",
                textStyle: {
                    color: "#7e7e7e",
                    fontSize: 18
                },
                subtextStyle: {
                    fontSize: 12,
                    color: "#7e7e7e",
                    fontWeight: "bold"
                }

            },
            legend: {
                top: '0%',
                left: '2%',
                orient: "vertical",
                itemGap: 2,
                itemHeight: 10,
                data: ["New task", "In progress", "Submitted"]

            },
            "series": [{
                "type": "pie",
                "radius": [
                    "30%",
                    "45%"
                ],
                color: "data",
                center: [
                    "50%",
                    "68%"
                ],
                "itemStyle": {
                    "borderRadius": 5,
                    "borderColor": "#fff",
                    "borderWidth": 2
                },
                "label": {
                    "show": true,
                    edgeDistance: 5,
                    // "position": "center",
                    "formatter": "{b|{c}}",
                    rich: {
                        a: {
                            width: 20,
                            fontSize: 8,
                            align: 'center'
                        },
                        b: {
                            fontSize: 12,
                            color: "#7e7e7e",
                            fontWeight: 600,
                            align: 'center'
                        }
                    }
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 64,
                        fontWeight: 'bold',
                        color: "#757575"
                    }
                },
                labelLine: {
                    show: true
                },
                data: [{
                        name: "New task",
                        value: statistics.start || 0,
                        itemStyle: {
                            color: "#FF5722"
                        }
                    },
                    {
                        name: "In progress",
                        value: statistics.save || 0,
                        itemStyle: {
                            color: "#FF9800"
                        }
                    },
                    {
                        name: "Submitted",
                        value: statistics.submit || 0,
                        itemStyle: {
                            color: "#689F38"
                        }

                    }
                ]
            }]
        }

        return chart
    }

    this.on({
        event: "page-focus",
        callback: async () => {
            await loadData()
        }
    })


    //////////////////////////////////////////////////////////////////////////////////////////////////

    const loadVersionChart = async sourceKey => {

        let response = await runRemote(getScript("GET_VERSION_CHART"), { options: { sourceKey: } })
        window.app.versionChart = response.data
        window.app.versionChart.tooltip.formatter = eval(window.app.versionChart.tooltip.formatter)

    }

    const showHystory = async sourceKey => {

        let loader = this.$djvue.loader({
            message: "ADE LABELING: Load history..."
        })

        await loadVersionChart(sourceKey)

        loader.cancel()

        let dialog = selectWidgets("f3hzvuayzn").getInstance()
        activateDialog(dialog, { data: {} })

    }


    this.on({
        event: "show-history",
        callback: async (sender, data) => {
            console.log("show-history",sender, data)
            await showHystory(data.sourceKey)
        }
    })



    //////////////////////////////////////////////////////////////////////////////////////////////////

    const selectionCriteria = selectWidgets("9z8cepwu18l")


    this.on({
        event: "change-has-sort",
        callback: (sender, data) => {
            window.app.dataFilter.hasSort = data
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { override: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })
    
    this.on({
        event: "change-has-task",
        callback: (sender, data) => {
            window.app.dataFilter.hasTask = data
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { override: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "change-has-workflow",
        callback: (sender, data) => {
            window.app.dataFilter.hasWorkflow = data
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { override: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "change-has-state",
        callback: (sender, data) => {
            window.app.dataFilter.hasState = data
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { override: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "all-task",
        callback: () => {
            window.app.dataFilter.task = window.app.taskList
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { extend: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "clear-task",
        callback: () => {
            window.app.dataFilter.task = []
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { extend: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "all-workflow",
        callback: () => {
            window.app.dataFilter.workflow = window.app.workflow
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { extend: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "clear-workflow",
        callback: () => {
            window.app.dataFilter.workflow = []
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { extend: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })


    this.on({
        event: "all-state",
        callback: () => {
            window.app.dataFilter.state = ["new task", "in progress", "submitted"]
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { extend: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "clear-state",
        callback: () => {
            window.app.dataFilter.state = []
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { extend: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "change-task",
        callback: (sender, data) => {
            window.app.dataFilter.task = data
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { override: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "change-workflow",
        callback: (sender, data) => {
            window.app.dataFilter.workflow = data
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { override: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "change-state",
        callback: (sender, data) => {
            window.app.dataFilter.state = data
            setTimeout(() => {
                selectionCriteria.update({ data: window.app }, { override: "options.data" })
                this.emit("apply-filter")
            }, 20)
        }
    })

    this.on({
        event: "apply-filter",
        callback: (sender, data) => {
            updateTable()
        }
    })

    //////////////////////////////////////////////////////////////////////////////////////////////////

    const updateView = () => {
        let instances = [selectWidgets(
            "cp4zeine4kj"
        )]

        setTimeout(() => {
            instances.forEach(d => {
                if (d) d.update({ data: window.app }, { override: "options.data" })
            })
        }, 10)

    }

    ////////////////////////////////////////////////////////////////

    window.app.options = {}

    window.app.currentView = "Latest Updates"

    console.log("START with options", window.app.options)


    user.grants = await loadGrants()

    if (!user.grants) {
        console.log("access denied")
        // let body = document.getElementsByTagName("body")[0]
        // let div = body.getElementsByClassName("app")[0]
        // let scripts = body.getElementsByTagName("script")
        // body.removeChild(div)
        // for (const s of scripts) {
        //     body.removeChild(s)
        // }
        return
    }
    user.altname = user.grants.namedAs
    user.profile = user.grants.profile
    user.role = user.grants.role

    window.app.loader = this.$djvue.loader({
        message: "ADE Task Dashboard: Loading data ..."
    })

    window.app.metadata = await loadMetadata()
    await loadData()
    updateView()

    this.emit("expand-all", { ignore: ["25klmtcysbm"] })
    this.emit("start")

    setTimeout(() => {
        window.app.lock = false
    }, 1000)

    window.app.loader.cancel()

}

if (!user.isLoggedIn) {

    this.$djvue.login()

}

bootstrap()