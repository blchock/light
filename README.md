# light
像光一样闪耀，像光一般迅捷，映入你眼中，所见即所得！

# 目录结构
## db-pages为数据库页面库
- 一级目录为公司名称，即组织代号org_id
- 二级目录为页面名称，即代码code
- 三级目录为项目配置文件
	- 其中readme.md为配置参数和页面描述
	- template.mustache为页面模板，对应数据库中template字段
	- style.css为页面样式，对应库中style字段
	- data.json为页面数据，对应库中data_json字段
    - function.js为页面函数，对应data_json中的函数内容：created,mounted和func
	- res为资源目录，对应data.json中的imgs数据

函数编写完毕后推荐使用 https://c.runoob.com/front-end/51 压缩成一行，然后填写到data_json中

## config.json为配置
- language 为当前语言
- mysql-* 为数据库配置，其中mysql_table为数据表建表语句参考 数据库设计 章节

## 设计目标
实现自由的网页页面可定制，使用模板语言，页面配置在数据库，实现热更新。

## 数据库设计
```sql
 CREATE TABLE `sr_wxapp_page` (
  `id_` bigint(20) NOT NULL COMMENT 'ID',
  `code` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '页面地址',
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标题',
  `template` text COLLATE utf8mb4_unicode_ci COMMENT '网页模板',
  `style` text COLLATE utf8mb4_unicode_ci COMMENT '网页css样式',
  `data_json` text COLLATE utf8mb4_unicode_ci COMMENT '网页参数 json文本',
  `org_id` bigint(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '公司组织',
  `version` bigint(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '版本号',
  `type` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '类型',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否有效',
  `change_by` bigint(20) DEFAULT NULL COMMENT '修改人',
  `change_date` datetime DEFAULT NULL COMMENT '修改时间',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建人',
  `create_date` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='light页面配置表（sr_wxapp_page）';
```

## 服务器设计思路
light页面全部可配置，通过node.js express读取数据库的页面数据，发送到静态页面中渲染
前端发送页面带参数，其中code对应数据库中的code（唯一字段），以此为依据拉取数据，
同时要判断前端的页面版本version是否匹配数据库中记录的version，判断orgType是否匹配数据库中记录的org_id组织类型（用于识别第三方客户），并判断数据库中is_active是否有效，
如果都满足，
node.js express端将数据库的数据发送到静态页面中page.html中：
数据库的数据和前端传的参数全部发给page
跳转页面的地址栏参数和自定义地址栏参数也都会发给当前页面，使用模板语言获取参数值，如地址栏：&abc=hello，模板中：{{abc}}，全局：data.abc
数据库中data_json字段中数据要解析成json,再把json中数据拆分成变量发给page。

## light模板开发介绍
light页面使用mustache语法渲染页面，在数据库中title字段是页面标题，
template数据存储的是页面模板，
data_json数据存储的是模板数据，
访问页面地址类似下面的url
http://192.168.200.185:8009/sr/h5/page.html?clientId=o2jgL4ySsttRVb7o6umdK1aDAtdo&accessToken=ed484c1d-46fb-4262-9ddd-7332ca3bcd04&orgType=test&requirementType=PR&isShowMenu=0&code=home&version=0.0.1#/
其中version字段需要与数据库中的相同字段匹配，代表该页面当前版本；type字段用于标识页面类型；is_active字段代表数据库中该页面是否启用；code字段也需要与链接中code匹配，代表该页面的名称

模版遵循mustache语法书写，data_json里的数据可以直接在模板中读取，页面参数如title,code.type,accessToken,orgType,isShowMenu,version以及数据库中的参数change_by,create_time等都可以直接在模版中读取。

同时light模板开发中还支持使用Zepto.js，JQuery以及Sign.js等插件功能。

## 模板特殊数据说明
data_json中有保留数据字段，以下表格中详细说明：

|保留字段名|字段内容|描述|
| :------------: | :------------ | :------------ |
|debug|  true,false两种值 | 代表是否开启日志打印，为true时会在浏览器控制台打印#Page信息，有标题，templates模板内容style页面样式，data模板数据  |
|designSize|  {"w":750,"h":1334} | 可以指定设计尺寸，所有图片和界面将按照设计尺寸适配屏幕，左侧为默认值，w宽度，h高度，单位px  |
|standard|  vw 或 vh | 使用s函数将设计尺寸转换为实际长度时，转换以x轴为基准填vw，以y轴为基准填vh |
|created| () => { 初始化代码段 } | 在页面加载后，模板渲染前，执行created中的脚本，脚本必须使用匿名函数，如()=>{} 或 function(){} |
|class|  字符串数组 | 引入外部样式代码库，可以从cdn上获取 |
|require|  字符串数组 | 引入外部js代码库，可以从cdn上获取 |
|mounted| () => { 初始化代码段 } | 在模板渲染后，也就是页面全部加载完成后，执行mounted中的脚本，脚本必须使用匿名函数，如()=>{} 或 function(){} |
| func  |  函数对象表（建议放到data_json末尾，以便访问data_json中其他数据），支持两种函数定义：可在模板中使用的匿名函数以及可全局调用的实名函数 | func中定义的函数可以在模板中调用，增加模板的灵活性。函数中可以访问上下文环境data（被访问的数据需要在func前定义，被访问的函数也需要定义在该函数之前），在函数中还可以使用zepto,jquery等插件  |
| lang  | 多语言参数对象，必须有cn简体对象，可以配置en英语，oth繁体。如："lang": {"cn":{"zg":"中国"},"oth":{"zg":"中國"},"en":{"zg":"China"}}  | 对多语言的配置，使用方式为在模板中{{#t}}zg{{/t}},t代表语言转换，zg是定义的单词变量名  |
| imgs  | 资源路径。如："imgs": {"a":"/api/file/down/123.png","b":{"url":"/api/file/down/abc.png","type":"css","area":{"w":36,"h":36,"l":50,"t":100}}}  | 资源的获取方式，使用方式为在模板中{{#i}}a{{/i}},i代表资源管理器，a是定义的资源名，内容字符串将直接返回图片路径，内容为对象时，如果type为css将返回样式内容，如果type不填或为其他则返回img内属性。{url:"图片地址",area:{w:宽,h:高,l:左侧距离,t:顶部距离},type:"css"返回类型为样式还是img中的属性} 裁剪lt值只在type为css时有用 用法: style="{{#i}}b{{/i}}" <img {{#i}}srcimg{{/i}} /> <img src="{{#i}}strimg{{/i}}" /> |
| imgpack  | 图集资源路径。如："imgpack": [{"name":"home","size":{"w":128,"h":512},"url":"/api/file/down/1270522462441967616.png","img":{"wx-icon-1":[4,358,114,114],"wx-icon-2":[4,240,114,114],"wx-icon-3":[4,122,114,114],"wx-icon-4":[4,4,114,114],"wx-next":[4,476,32,32]}}]  | 支持TexturePacker生成的图集，生成参数：DataFormat: TreSensa，建议将Border padding和Shape Padding设置为>=4，Inner Padding>=2(保证屏幕适配稳定)，必填参数：name图集名，size大图尺寸，url大图路径，使用方式与imgs资源一样，只是映射图集到图片的作用，除了url，area之外还多一个参数from: "home" 表示来自哪张图集 |

## 编程指南

### 模板内置函数列表
{{#t}}国际化字段名称{{/t}} 转换国际化语言
{{#i}}资源名{{/i}} 获取资源图片（资源路径以/api开头为相对地址，否则为网络绝对地址）
{{#u}}相对路径{{/u}} 获取全路径（路径要以/开头）
{{#go}}跳转页面json参数列表{{/go}} 跳转到项目内或项目外的页面

> 参数：url 直接使用url，goType 跳转类型，path 路径，route 路由，page 页面，ext 后缀，args 后参数，其他的都作为键值对放参数中
> 地址拼接模式：path(window.location.origin) + route(/sr/h5/) + page + ext(.html) ? clientId,accessToken,orgType,... + #/ + args;
> goType 跳转类型：href当前页面，open新的窗口，string 不跳转只返回

{{#s}}数值{{/s}} 获取数值对应的设计分辨率px长度，在实际页面上应该显示的长度和单位，in: 30 out: 4vw

### 模板内置函数说明
模板内函数都支持嵌套调用和内联调用两种方式
内联调用指的是直接在html模板中调用，如: {{#t}}china{{/t}},{{#go}}{"code":"demo","version":"0.0.1"}{{/go}}
嵌套调用指的是支持在mustacher遍历中调用遍历对象的属性，如：{{#users}}{{#i}}icon{{/i}}姓名：{{#t}}name{{/t}}{{#go}}link{{/go}}{{/users}} json数据：{"users":[{"name":"bcc","icon":"/api/haha.png","link":{"code":"demo","version":"0.0.1"}}]}

### 全局函数列表（上下文配置）
新建Tag newTag(params) params为地址栏参数，格式同go模板，其中如果传了tag则名称就是tag，如果不传则默认取code为tag名称，如果既没有tag字段，又没有code字段则会返回出错，创建成功后以tag为名可以通过goTag跳转或者通过模板函数{{go}}跳转
跳转至Tag goTag(tag, params)  params为地址栏参数，格式同go模板，参数tag指定要跳转的tag名称，函数会先读取该tag的参数列表，然后把params中的参数合并（覆盖）到tag原本的参数列表中，最后跳转至合并后的参数集合对应的页面中
模板内跳转Tag使用{{go}}，传入tag字段即可，同goTag，会先取tag字段对应的参数列表，再将模板函数go的其他参数合并，最后跳转。

### TexturePacker打包图集方式 {{#i}}
新建图集，然后拖入所有待打包图片

图集类型DataFormat: TreSensa
图集边距设置

- Border padding: >=4   图集最外面边距
- Shape Padding: >=4    小图间距
- Inner Padding:>=2     图片内边距（设置一个值以保证屏幕适配稳定，因为在不同手机上适配需要使用百分比单位，不使用px固定像素，进行百分比缩放时目前会出现像素波动，如果不设置图片内边距将导致小图显示边缘缺失）

当设置Inner Padding之后，页面设计时要考虑显示图片的区域要加上这个padding值，否则会使图片显示变小，比如设置了2的inner-padding，图片宽32px，则显示的img应该设置为32+2*2=36px宽

图集设置好后存储tps文件（Save），然后点Publish发布按钮，这时候会自动生成js文件和png大图文件。
将图集.js文件打开，类似于下面的内容，
``` js
TGE.AssetManager.SpriteSheets["home"] = {

    "wx-icon-1":[126, 126, 118, 118],  
    "wx-icon-2":[4, 126, 118, 118],  
    "wx-icon-3":[126, 4, 118, 118],  
    "wx-icon-4":[4, 4, 118, 118],  
    "wx-next":[4, 248, 36, 36]
};
```
我们只使用其中的大括号中的内容，在json_data中添加字段imgpack:[]（如果不存在），代表图集数组，在数组中插入一个对象，对象有name字段，填写图集名称；size字段，填写图集的png图片尺寸(w,h代表图片宽高)；url字段，填写图集的png图片上传到test系统中后的路径，img字段就是图集数据，将图集导出的js文件中大括号的内容拷贝过来放到img字段下即可使用。
上传图片的方式为:

- test系统，如192.168.200.95，
- 登录后选择菜单：系统设置->设置->企业通用设置->企业图标设置->上传图片
- 选择导出的大图png文件->提交->在图片列表里找到最后面刚刚上传的图片
- 将URL地址拷贝到url字段中即可

以下为示例：
``` json
 "imgpack": [
        {
            "name": "home",
            "size": {
                "w": 256,
                "h": 512
            },
            "url": "/api/file/down/1270597733585129472.png",
            "img": {
                "wx-icon-1":[126, 126, 118, 118],  
                "wx-icon-2":[4, 126, 118, 118],  
                "wx-icon-3":[126, 4, 118, 118],  
                "wx-icon-4":[4, 4, 118, 118],  
                "wx-next":[4, 248, 36, 36]
            }
        }
    ],
```
这样声明后，在页面加载时小图片的使用方式将和imgs中定义的图片一样，直接使用{{#i}}资源名{{/i}}访问即可，如{{#i}}wx-icon-1{{/i}}，默认屏幕适配方式为vw宽度适配，如果需要使用vh单位，则在json_data中添加 "standard": "vh" 配置项即可。

### 屏幕适配方案 {{#s}}
默认在图片里自动使用了屏幕适配方案，
也可以通过{{#s}}数值{{/s}}手动计算某像素px单位内容的屏幕适配值，在字体上使用通常很有用：
``` html
<p style="font-size: {{#s}}20{{/s}}; line-height: {{#s}}30{{/s}};">{{#t}}content{{/t}}</p>
```
还可以使用上下文配置中的scale对象值，里面有w,h分别代表实际显示尺寸px与设计尺寸px的比例

### 跳转实现方案 {{#go}}
``` html
{{#go}}跳转页面json参数列表{{/go}}
```
参数：url 直接使用url，goType 跳转类型，path 路径，route 路由，page 页面，ext 后缀，args 后参数，其他的都作为键值对放参数中
地址拼接模式：path(window.location.origin) + route(/sr/h5/) + page + ext(.html) ? clientId,accessToken,orgType,... + #/ + args;
goType 跳转类型：href当前页面，open新的窗口，string 不跳转只返回
{{#go}}历史记录后退值{{/go}}
#### 跳转示例：
|跳转类型|示例|描述|
| :------------: | ------------ | :------------ |
|内联跳转|onclick="{{#go}}{"url":"https://www.baidu.com/","goType":"open"}{{/go}}"|在新窗口打开百度页面|
|内联跳转|onclick="{{#go}}{"url":"https://www.baidu.com/","goType":"href"}{{/go}}"|在当前窗口打开百度页面|
|内联跳转|<span>{{#go}}{"url":"https://www.baidu.com/"}{{/go}}</span>|将网址内容直接返回，不跳转|
|内联跳转|onclick="{{#go}}{"code":"demo","version":"0.0.1"}{{/go}}"|跳转到light页面demo，版本号0.0.1|
|内联跳转|onclick="{{#go}}{"code":"home","version":"0.0.1","goType":"open"}{{/go}}"|新窗口跳转到light首页home版本号0.0.1|
|内联跳转|onclick="{{#go}}-1{{/go}}"|返回上一页（当使用了href方式跳转后生效）|
|上下文配置中跳转 {{#go}}goto{{/go}}其中goto定义在上下文配置中|"goto": {"code": "home","version": "0.0.1","goType": "open"}|新窗口跳转到light首页home版本号0.0.1，该配置在上下文环境中，所以在模板template中只需要使用{{#go}}goto{{/go}}即可|
|上下文配置跳转|"goto": {"page":"sr","templateCode":"customerApp1","ext":false,"orgId":"1159711601767616512","workerId":"6396000617","requireType":"PR","isShowMyRequireLink":true,"args":"requireSubmit"}|跳转到定制模板页面customerApp1中http://192.168.200.95/sr/h5/sr?accessToken=fd05fcd2-2e30-4b97-b289-a2c5611b324c&clientId=o2jgL4ySsttRVb7o6umdK1aDAtdo&orgCode=test&workerId=6396000617&requireType=PR&isShowMyRequireLink=true&templateCode=customerApp1&orgId=1159711601767616512#/requireSubmit 其中工号为6396000617，组织id为1159711601767616512，其他参数都是定制模板页面的自定义参数|
|上下文配置跳转|"goto": {"route": "/h5/mytask/","page": false,"ext": false,"args": "workPlaceLists?source=locinventory"}|跳转到H5项目中的页面，route传应用路由，page,ext传false代表不需要指定页面文件（使用vue的路由不需要page.html），args代表#/之后的参数，一般是H5中应用参数地址http://192.168.200.95/h5/mytask/?accessToken=fd05fcd2-2e30-4b97-b289-a2c5611b324c#/workPlaceLists?source=locinventory|

#### Go指令也支持自定义任意的http请求，格式如下：

- [path] [route] [page] [ext]?accessToken=???&[any key]=value #/ [args]

|特殊键值对名|值示例|描述|
| :------------: | ------------ | :------------ |
|T|是/否|是否对url做国际化处理，true时对所有键值对检验，如果存在国际化则执行转换|
|type|跳转类型|兼容goType：跳转类型：href当前页面，open新的窗口，string 不跳转只返回|
|tag|跳转到tag|从tag标签库中寻找tag对应的链接数据，跳转到tag页面，其他参数将合并进去|
|addTag|添加tag|以当前链接数据为基准创建新的tag，addTag的值就是新tag的名称|

如果page不为false则在accessToken之后会加上&clientId=???&orgType=???
如果page不为false并且templateCode有值则会加上orgCode=???替换orgType
接下来会将未识别的参数全部加到get键值对中
最后加上#/和后面的参数args
比如
- https://www.liepin.com/job/1927300809.shtml?id=12321&best=true#/onMount
可以被拆解为
- [https://www.liepin.com][/job/][1927300809][.shtml]?[id]=12321&[best]=true#/[onMount]
因此其go配置为
``` json
{"path":"https://www.liepin.com","route":"/job/","page":"1927300809","ext":".shtml","id":"12321","best":"true","args":"onMount"}
```
或者可以配置为
``` json
{"url":"https://www.liepin.com/job/1927300809.shtml?id=12321&best=true#/onMount","goType":"open"}
```
goType参数为跳转类型，如果使用url自定义链接方式，则一定要配置goType，不配置将直接返回链接内容

## light模板开发实例
以下为一个简单实例，介绍light数据库配置页面和参数传递事件定义全流程：
##### style
``` css
.test-pl {
    padding: 10px;
    background-color: aliceblue;
}
#aNum,#bNum {
    width: 30px;
}
.test-btn {
    margin-left: 20px;
    width: 120px;
    height: 30px;
    line-height: 30px;
}
```

##### data_json
``` json
{
	"debug": true,
	"ver": "0.0.1",
	"personName": "test",
	"lang": {
		"cn": {
			"test": "深圳市TEST"
		},
		"oth": {
			"test": "深圳市TEST"
		},
		"en": {
			"test": "Shenzhen test"
		}
	},
	"func": {
		"hello": "()=>{ return 'hello,world! ' + data.personName }",
		"testAdd": "function testAdd() {$('#retNum').html(Number($('#aNum').val()) + Number($('#bNum').val())); }"
	}
}
```

##### template
``` html
<div>
    <h1>{{hello}}</h1>
    <h2>{{#t}}test{{/t}} {{orgType}}</h2>
    <p>version: {{ver}} </p>
    <p class="test-pl">
        <input type="text" id="aNum" /> + <input type="text" id="bNum" /> = <span id="retNum">0</span>
        <button class="test-btn" onclick="testAdd()">求和计算</button>
    </p>
</div>
```

##### 页面说明

> 第一行代码h1中读取了模板数据中的hello函数，该函数是匿名函数，返回一个字符串，字符串中读取了模板数据的personName字段的内容，这里要注意personName需要在func->hello之前定义，才能被hello函数使用；在模板中用{{hello}}可以访问匿名函数hello
>
> 第二行代码h2中读取了国际化的字符串test，接一个空格后读取了微信地址栏中参数orgType组织类型
>
> 第三行代码{{ver}}直接访问了模板数据中的ver数据0.0.1，这是通用的mustache语法
>
> 第四行代码定义了一个段落，段落中声明了两个input输入框和一个span文本框，定义了一个按钮“求和计算”，该按钮onclick访问了testAdd函数；这个函数也定义在模板数据的func中，这时候定义的不是匿名函数，所以实际访问的是testAdd全局函数，该函数使用jquery访问了页面中的两个input输入框，从中间取值然后执行相加运算，赋值给文本框显示出来。这时候定义的func中的键名其实没有作用，只是作为一个id而已，键对应的值中定义了真正的函数名，这样的定义方式无法用{{testAdd}}来访问




