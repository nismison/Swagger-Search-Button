// ==UserScript==
// @name         Swagger Search Button
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add a search button to the Swagger
// @author       Nismison
// @match        http://*/swagger-ui.html
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    const input = document.createElement('input')
    const searchNode = document.createElement('div')
    const searchBtn = document.createElement('button')

    let searchResults = []
    let searchResultsIndex = 0
    let searchText = ''
    let timeoutId = 0

    searchBtn.innerText = '搜索'
    searchBtn.style = 'padding: 0 20px;background: #fff;border: 1px solid #f5f5f5;width: auto;height: 40px;border-radius: 5px;box-shadow: 0 0 5px #1111113b;margin-left:10px;outline:none;'
    input.style = 'width:200px;height:40px;background:#fff;border:1px solid #f5f5f5;border-radius:5px;outline:none;padding:5px 10px;box-shadow:0 0 5px #1111113b;'
    input.setAttribute('placeholder', '在此搜索内容')
    searchNode.style = 'width:auto;height:40px;position:fixed;top:60px;right:30px;'

    searchNode.appendChild(input)
    searchNode.appendChild(searchBtn)
    document.body.appendChild(searchNode)

    input.addEventListener('input', () => {
        searchResults = []
        searchResultsIndex = 0
        searchBtn.innerText = '搜索'
    })

    searchBtn.addEventListener('click', e => search())
    input.addEventListener('keydown', e => e.code === 'Enter' && search())

    function search() {
        const curUrl = window.location.href.split('#')[0]
        const value = input.value
        if (value === searchText) {
            // 下一个
            if (!searchResults.length) return
            searchResultsIndex += 1
            if (searchResultsIndex > searchResults.length - 1) searchResultsIndex = 0
            searchBtn.innerText = `下一个(${searchResultsIndex + 1}/${searchResults.length})`
        } else {
            // 新搜索
            searchText = value
            document.querySelectorAll('h4[id]').forEach(item => {
                const parentClass = item.parentElement.className
                !parentClass.includes('is-open') && item.click()
            })
            const optsNodes = document.querySelectorAll('div.opblock[id]')
            const optsInnerText = document.querySelectorAll('div.opblock[id] .opblock-summary-description')
            const optsUrls = document.querySelectorAll('div.opblock[id] a > span')

            const opts = []
            optsNodes.forEach((item, index) => {
                opts.push({
                    node: item,
                    des: optsInnerText[index].innerText || '',
                    url: optsUrls[index].innerText || ''
                })
            })

            for (let i = 0; i < opts.length; i++) {
                if (opts[i].des.includes(value) || opts[i].url.includes(value)) {
                    searchResults.push(curUrl + '#' + opts[i].node.id)
                }
            }

            if (searchResults.length) {
                searchBtn.innerText = `下一个(${searchResultsIndex + 1}/${searchResults.length})`
            } else {
                alert('没有结果')
                return
            }
        }
        window.location.href = searchResults[searchResultsIndex]
        clearTimeout(timeoutId)
        document.querySelectorAll('div.opblock[id]').forEach(item => item.style = 'background: rgba(73,204,144,.1);transition: background 0.5s;')
        document.querySelector(`#${searchResults[searchResultsIndex].split('#')[1]}`).style = 'background: rgb(255,188,0,0.3);transition: background 0.5s;'
        timeoutId = setTimeout(() => {
            document.querySelectorAll('div.opblock[id]').forEach(item => item.style = 'background: rgba(73,204,144,.1);transition: background 0.5s;')
        }, 1000)
    }
})()