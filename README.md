# Epage Cli

[epage](https://github.com/didi/epage) cli tool

## Usage

```sh
npm i epage-cli -g

epage init myEpage

# or select template
epage init myEpage --tpl vant
# or use custom template
epage init myEpage --tpl git@github.com:epage-team/epage-template-vant.git
```

**注意**

`epage init <projectName>` 后面可跟参数

- `--tpl`：选择初始化模板，不带此参数默认`iview`模板(PC)，移动端渲染组件可附带参数`vant`
- `-v` (`--version`)：查看脚手架版本

## Docs

- [Epage](http://epage.didichuxing.com/)
- [How to develop widget?](http://epage.didichuxing.com/developer/widget.html)

## License

[MIT](./LICENSE)
