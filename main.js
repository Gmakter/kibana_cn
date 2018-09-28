const jsonFile = require("jsonfile");
const readline = require("readline-sync");
const fs = require("fs");
var path = require('path');
Array.prototype.remove = function () {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
String.isEmptyOrSpaces = function (value) {
    if (value == null || value == undefined || value.length == 0) {
        return false;
    }
    var char = value.split('');
    for (let index = 0; index < char.length; index++) {
        const element = char[index];
        if (!(element == " ")) {
            return false;
        }
    }
    return true;
}
function fsExistsSync(path) {
    try{
        fs.accessSync(path,fs.F_OK);
    }catch(e){
        return false;
    }
    return true;
}
function fileDisplay(filePath){
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath,function(err,files){
        if(err){
            console.warn(filePath+err)
        }else{
            //遍历读取到的文件列表
            files.forEach(function(filename){
                //获取当前文件的绝对路径
                var filedir = path.join(filePath,filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir,function(eror,stats){
                    if(eror){
                        console.warn('获取文件stats失败');
                    }else{
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if(isFile){
                            // console.log(filedir);
                        }
                        if(isDir){
                            fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });
}

var option = {
    current: "",
    target: "",
    localtion: "",
    conf: {},
};
// option.localtion = readline.question("input kibana root directory:");
// option.target = readline.question("input target language:");
option.localtion = "D:\\server\\ELK\\kibana-6.4.0";
option.target = "cn";

jsonFile.readFile("kibana_resource-6.4.0.json")
    .then(obj => {
        option.conf = obj;
        /**开始遍历 */
        option.conf.forEach(element => {
            var keys = Object.keys(element);
            keys.remove('path');
            keys.remove(option.target);
            var localtion
            if(element["path"].startsWith("/")){
                localtion = option.localtion + element["path"];
            }else{
                localtion = option.localtion+"/" + element["path"];
            }
            var exist = fs.existsSync(localtion);

            if (exist) { //存在

                var stat = fs.lstatSync(localtion);
                if (!stat.isDirectory()) { //当前为文件
                    try {
                        for (let index = 0; index < keys.length; index++) {
                            const language = keys[index];
                            if (!String.isEmptyOrSpaces(element[option.target]) && !String.isEmptyOrSpaces(element[language])) {
                                var file = fs.readFileSync(localtion);
                                var content = file.toString();
                                if(content.indexOf(element[language])>-1){
                                    fs.writeFileSync(localtion, content.replace(element[language], element[option.target]));
                                    console.log("替换完成"+element[language]);
                                }
                            }
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else { //当前为目录
                    try {
                        if(fsExistsSync(path)){
                            var fileList=fileDisplay(path);
                            if(fileList!=null){
                                for (let index = 0; index < fileList.length; index++) {
                                    const filelocation = file[index];
                                    for (let index = 0; index < keys.length; index++) {
                                        const language = keys[index];
                                        if (!String.isEmptyOrSpaces(element[option.target]) && !String.isEmptyOrSpaces(element[language])) {
                                            var file = fs.readFileSync(filelocation);
                                            var content = file.toString();
                                            if(content.indexOf(element[language])>-1){
                                                fs.writeFileSync(localtion, content.replace(element[language], element[option.target]));
                                            }
                                        }else{
                                            console.warn(element[language]+"或"+element[option.target]+"为空");
                                        }
                                    }
                                }
                                console.log("批量完成任务");
                            } 
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }else{
                console.log("不存在:"+localtion)
            } 
        });
    });

