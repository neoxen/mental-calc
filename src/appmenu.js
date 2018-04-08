const { app } = require('electron');

export var appMenuTemplate = [
    {
        label: 'File',
        submenu: []
    },
    {
        label: 'View',
        submenu: [
            {
                role: 'reload'
            },
            {
                role: 'forcereload'
            },
            {
                role: 'toggledevtools'
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: '有问题请联系：neoxen@qq.com'
                // click() { require('electron').shell.openExternal('http://www.jianshu.com/u/a7454e40399d'); }
            }
        ]
    }
];