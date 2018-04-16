import { ipcRenderer, remote } from 'electron';

const { Menu, MenuItem, dialog } = remote;

let currentFile = null; // 当前文档保存的路径
let isSaved = true;     // 当前文档是否已保存
let txtEditor = document.getElementById('txtEditor'); // 获得TextArea文本框的引用

document.title = "数学口算出题系统"; // 设置文档标题，影响窗口标题栏名称


//监控文本框内容是否改变
txtEditor.oninput=(e)=>{
    if(isSaved) document.title += " *";
    isSaved=false;
};

//监听与主进程的通信
ipcRenderer.on('action', (event, arg) => {
    switch(arg){
        case 'new': //新建文件
            askSaveIfNeed();
            currentFile=null;
            txtEditor.value='';
            document.title = "Notepad - Untitled";
            //remote.getCurrentWindow().setTitle("Notepad - Untitled *");
            isSaved=true;
            break;
        case 'open': //打开文件
            askSaveIfNeed();
            const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                filters: [
                    { name: "Text Files", extensions: ['txt', 'js', 'html', 'md'] },
                    { name: 'All Files', extensions: ['*'] } ],
                properties: ['openFile']
            });
            if(files){
                currentFile=files[0];
                const txtRead=readText(currentFile);
                txtEditor.value=txtRead;
                document.title = "数学口算出题系统 - " + currentFile;
                isSaved=true;
            }
            break;
        case 'save': //保存文件
            saveCurrentDoc();
            break;
        case 'exiting':
            askSaveIfNeed();
            ipcRenderer.sendSync('reqaction', 'exit');
            break;
    }
});

//读取文本文件
function readText(file){
    const fs = require('fs');
    return fs.readFileSync(file, 'utf8');
}
//保存文本内容到文件
function saveText(text, file){
    const fs = require('fs');
    fs.writeFileSync(file, text);
}

//保存当前文档
function saveCurrentDoc(){
    if(!currentFile){
        const file = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
            filters: [
                { name: "Text Files", extensions: ['txt', 'js', 'html', 'md'] },
                { name: 'All Files', extensions: ['*'] } ]
        });
        if(file) currentFile=file;
    }
    if(currentFile){
        const txtSave=txtEditor.value;
        saveText(txtSave, currentFile);
        isSaved=true;
        document.title = "Notepad - " + currentFile;
    }
}

// 如果需要保存，弹出保存对话框询问用户是否保存当前文档
function askSaveIfNeed(){
    if(isSaved) return;
    const response=dialog.showMessageBox(remote.getCurrentWindow(), {
        message: 'Do you want to save the current document?',
        type: 'question',
        buttons: [ 'Yes', 'No' ]
    });
    if(response==0) saveCurrentDoc(); // 点击Yes按钮后保存当前文档
}


const selectTxtType = document.getElementById('txtType');
const btnGenerate = document.getElementById('btnGenerate');
const btnPrint = document.getElementById('btnPrint');

const txtType = document.getElementById('txtType');
const calcProlems = document.getElementById('calcProblems');

const txtAmount = document.getElementById('txtAmount');
const txtName = document.getElementById('txtName');
const txtClass = document.getElementById('txtClass');
const txtNumber = document.getElementById('txtNumber');

const spanName = document.getElementById('spanName');
const spanClass = document.getElementById('spanClass');
const spanNumber = document.getElementById('spanNumber');

selectTxtType.onclick=(e)=>{
    btnGenerate.className = 'btn btn-success';
    btnGenerate.disabled = false;
};

btnGenerate.onclick=(e)=>{
    btnPrint.className = 'btn btn-success';
    btnPrint.disabled = false;

    spanName.innerText = txtName.value;
    spanClass.innerText = txtClass.value;
    spanNumber.innerText = txtNumber.value;

    let pArray =  generateProblems(txtAmount.value);

    let problemType = txtType.value;
    let problems = '<ul style="">\n';

    for ( let i = 1; i < pArray.length; i++) {
        problems += '<li style="text-align: left;display: inline-block;width: 160px;">' + pArray[i] + '</li>\n';
    }
    problems += '</ul>\n';
    calcProlems.innerHTML = problems;
};

function generateProblems(amount){
    const problemArray = new Array(amount);

    for (let i = 0; i < amount; i++){
        problemArray.push(randomRange(0, 9) + '+' + randomRange(0, 9) + '=');
    }

    return problemArray;
}

function randomRange(myMin, myMax){
    return Math.floor(Math.random() * (myMax - myMin + 1) + myMin);
}


btnPrint.addEventListener('click', function (event) {
    ipcRenderer.send('print-to-pdf');
});

ipcRenderer.on('wrote-pdf', function (event, path) {
    const message = `PDF 保存到: ${path}`;
    document.getElementById('pdf-path').innerHTML = message;
})

