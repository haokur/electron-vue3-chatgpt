import { ElMessage, ElMessageBox } from "element-plus";

export const CommonUtil = {
    fmtTextByData(targetStr, data, FormatFuncMap = {}) {
        const regex = /\[\[(.*?)\]\]/g;
        const matches = targetStr.match(regex);
        if (Array.isArray(matches)) {
            matches.forEach((match) => {
                try {
                    let _key = match.slice(2, -2);
                    let _replaceText = "";
                    if (_key.includes("|")) {
                        // 尝试用方法替换 类似time|dateformat|yyyy-mm-dd
                        let [dataKey, funcName, ...otherParams] = _key.split("|");
                        if (FormatFuncMap[funcName]) {
                            // console.log(data[dataKey], otherParams, "base.ts::79行");
                            _replaceText =
                                FormatFuncMap[funcName](data[dataKey], ...otherParams) || "";
                        } else {
                            console.log(`FmtFuncMaps上不存在${funcName}方法test.html::128行`);
                        }
                    } else {
                        // 尝试用对象变量替换
                        _replaceText = data[_key] || "";
                    }
                    targetStr = targetStr.replace(match, _replaceText);
                } catch (error) {
                    console.log(error, "auth.utils.js::80行");
                }
            });
        }
        return targetStr;
    },

    fmtDate(date, format = "yyyy-MM-dd hh:mm:ss") {
        if (!date) return "--";
        // 兼容部分ios "-" 转换错误
        if (typeof date === "string" && !date.includes("T")) {
            date = date.replace(/-/g, "/");
        }
        if (/\d{13}/.test(date)) {
            date = date - 0;
        }
        let dateObj = new Date(date);
        let o = {
            "y+": dateObj.getFullYear(),
            "M+": dateObj.getMonth() + 1, //month
            "d+": dateObj.getDate(), //day
            "h+": dateObj.getHours(), //hour
            "m+": dateObj.getMinutes(), //minute
            "s+": dateObj.getSeconds(), //second
            "q+": Math.floor((dateObj.getMonth() + 3) / 3), //quarter
            S: dateObj.getMilliseconds(), //millisecond
        };

        // 匹配到其他非年份的
        Object.keys(o).map((key) => {
            let _regex = new RegExp("(" + key + ")");
            let _result = _regex.exec(format);
            if (_result) {
                let _match = _result[0];
                let _value = `00${o[key]}`;
                // 从后往前匹配到 _match 所需的长度，算出起始位置（_value.length - _match.length），
                // 截取到_value的最后一位
                let _target = _value.substring(
                    _value.length - _match.length,
                    _value.length
                );
                format = format.replace(_match, _target);
            }
        });
        return format;
    },

    // origin和target的matchKeys的值,是否都相等
    isMatchAllKeys(origin, target, matchKeys) {
        matchKeys.every(key => origin[key] === target[key])
    },
    // 从newArr数组中捡出originArr数组不存在matchKeys的值
    diffSelectByMatchKeys(newArr: any[], originArr: any[], matchKeys: string[]) {
        let diffArr: any[] = []
        newArr.forEach(item => {
            let isExist = originArr.some(row => matchKeys.every(key => row[key] === item[key]))
            // let isExist = originArr.some(row => this.isMatchAllKeys(row, item, matchKeys))
            if (!isExist) {
                diffArr.push(item)
            }
        })
        return diffArr
    },
    // 从A数组中,根据matchKeys,筛选出B数组中的值
    filterSelectByMatchKeys(newArr: any[], originArr: any[], matchKeys: string[]) {
        let filteredArr: any[] = []

    },
    /**下载Excel */
    downloadExcel(blobData, name) {
        let blob = new Blob([blobData], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        let link = URL.createObjectURL(blob);
        this.download(link, name, 'xlsx')
    },
    /**
     * 创建a标签,触发点击下载
     * @param uri 下载链接地址
     * @param name 保存文件名
     * @param ext 文件后缀名
     */
    download(uri: string, name: string, ext: string) {
        //通过创建a标签实现
        var link = document.createElement('a');
        let _now = this.fmtDate(new Date(), 'yyyy_MM_dd_hh_mm_ss');
        link.href = uri;
        //对下载的文件命名
        link.download = `${name}_${_now}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // 手动解析：以{开头，以}结尾，以,分割，以:再分割，删除空格，
    // 键加双引号，值是单引号替换成双引号，无引号的转换为数字
    // 常用场景为从js对象，要贴到json配置文件中时
    parseStr2JsonStr(str: string) {
        str = str.trim()
        // 不能简单JSON.parse时，手动解析
        str = str.replace('{', '').replace('}', '')
        let keyValueArr = str.split(',')
        let keyValueObj = {}
        keyValueArr.forEach(item => {
            let [key, value] = item.split(":")
            key = key.trim()
            value = value.trim()
            if (value.startsWith('"') || value.startsWith("'")) {
                value = value.substring(1, value.length - 1)
            } else {
                // @ts-ignore
                value = Number(value)
            }
            keyValueObj[`${key}`] = value
        })
        return JSON.stringify(keyValueObj)
    },

    // 类似数组筛选特定条件的项,这里用key筛选需要的值,返回对象
    filterObj(obj, keys: string[] = []) {
        let _newObj = {}
        keys.forEach(key => {
            _newObj[key] = obj[key]
        })
        return _newObj
    },

    // element操作相关
    $message(msg: string, type = 'success') {
        ElMessage({
            type: type,
            // @ts-ignore
            message: msg,
        })
    },
    $success(msg) {
        this.$message(msg, 'success')
    },
    $error(msg) {
        this.$message(msg, 'error')
    },
    $warn(msg) {
        this.$message(msg, 'warn')
    },
    $confirm(content, title = '⚠️警告') {
        return ElMessageBox.confirm(
            content,
            title,
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        ).catch()
    },

    // 根据文件路径，获取文件基本信息
    getFileInfoObj(filePath) {
        let splitSymbol = "\\"
        console.log(filePath, splitSymbol, "file.util.ts::172行");
        let _arr = filePath.split(splitSymbol)
        let fileDirPath = _arr.slice(0, -1).join(splitSymbol)
        let _fileArr = _arr[_arr.length - 1].split(".")
        let fileName = _fileArr.slice(0, -1).join('.')
        let fileExt = _fileArr[_fileArr.length - 1]
        console.log(_fileArr, fileName, "file.util.ts::176行");
        return {
            fileDirPath,
            fileName,
            fileExt,
        }
    },

    // 获取图片尺寸
    getImgSizeInfo(filePath) {
        return new Promise((resolve, reject) => {
            let _img = new Image()
            _img.src = filePath
            _img.onload = (ev) => {
                console.log(ev, _img, "common.util.ts::206行");
                resolve({
                    path: filePath,
                })
            }
        })
    }
}