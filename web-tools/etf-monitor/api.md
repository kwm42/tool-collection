下面这份是目前量化圈最常用的 东方财富 push2 行情接口速查文档，专门针对：

https://push2.eastmoney.com/api/qt/stock/get
接口说明
请求地址
https://push2.eastmoney.com/api/qt/stock/get
请求参数
参数	说明
secid	市场.代码
fields	返回字段列表
ut	可选，校验参数
cb	可选，jsonp回调
secid规则
A股
市场	前缀
上海	1
深圳	0
北交所	0

例如：

1.600519
1.513500
0.000001
0.300750
港股
116.00700
116.09988
代码	股票
00700	腾讯
09988	阿里
美股
105.MSFT
105.AAPL
105.NVDA
推荐参数
最简实时行情
fields=f43,f44,f45,f46,f47,f48

返回：

{
  "f43":1384,
  "f44":1392,
  "f45":1378,
  "f46":1381,
  "f47":1530000,
  "f48":212300000
}
常用字段表
基本信息
字段	含义
f57	代码
f58	名称
f84	总股本
f85	流通股本
价格
字段	含义
f43	最新价
f44	最高
f45	最低
f46	开盘
f60	昨收
涨跌
字段	含义
f169	涨跌额
f170	涨跌幅
f171	振幅
成交
字段	含义
f47	成交量
f48	成交额
f168	换手率
市值
字段	含义
f116	总市值
f117	流通市值
PE/PB
字段	含义
f162	市盈率TTM
f167	市净率
五档盘口

请求：

fields=f31,f32,f33,f34,f35,f36,f37,f38,f39,f40

返回：

{
  "f31":1384,
  "f32":500,
  "f33":1383,
  "f34":2000,
  "f35":1382,
  "f36":1000
}
买盘
字段	含义
f31	买一价
f32	买一量
f33	买二价
f34	买二量
f35	买三价
f36	买三量
f37	买四价
f38	买四量
f39	买五价
f40	买五量
卖盘
字段	含义
f19	卖一价
f20	卖一量
f17	卖二价
f18	卖二量
f15	卖三价
f16	卖三量
f13	卖四价
f14	卖四量
f11	卖五价
f12	卖五量
价格精度

非常重要：

{
  "f43":1384,
  "f59":3
}

表示：

price = f43 / 10**f59

结果：

1.384
f59含义
f59	精度
2	保留2位
3	保留3位
4	保留4位
ETF推荐字段

对于 513500：

fields=
f43,
f44,
f45,
f46,
f47,
f48,
f57,
f58,
f59,
f60,
f169,
f170,
f171

完整写法：

https://push2.eastmoney.com/api/qt/stock/get
?secid=1.513500
&fields=f43,f44,f45,f46,f47,f48,f57,f58,f59,f60,f169,f170,f171
Python示例
import requests

url = "https://push2.eastmoney.com/api/qt/stock/get"

params = {
    "secid": "1.513500",
    "fields": "f43,f58,f57,f59,f169,f170"
}

j = requests.get(url, params=params).json()

d = j["data"]

price = d["f43"] / (10 ** d["f59"])

print(price)
print(d["f170"] / 100)
溢价率获取

stock/get 本身通常只返回交易行情。

ETF套利真正需要：

ETF成交价
IOPV(实时净值)
溢价率

其中：

成交价 → stock/get
IOPV → ETF专用接口
溢价率 → 自己计算
premium = (price - iopv) / iopv * 100