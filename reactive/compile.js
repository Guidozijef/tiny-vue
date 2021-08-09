let startReg = /^\<(\w+)\>/;
let endReg = /^\<\/(\w+)\>/;
// 开始标签尾
startTagClose = /^\s*(\/?)>/, 
// 标签属性
attribute = /^\s*([^\s"'<>\/=]+)(?:\s*((?:=))\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,


function compile(template) {
  let stack = [{ root: "root", children: [] }];
  let str = "";
  let index = 0
  parse (template)
  // 闭包保存template不被销毁，不然无法剪切template
  function parse(template) {
    while (template) {
      let textEnd = template.indexOf("<");
      if (textEnd === 0) {
        str = "";
        if (startReg.test(template)) {
          let matchTag = template.match(startReg);
          stack.push({ tag: matchTag[1], children: [], start: index, end: index + matchTag[0].length });
          advance(matchTag[0].length);
          
        } else if (endReg.test(template)) {
          let matchTag = template.match(endReg);
          let ele = stack.pop();
          stack[stack.length - 1].children.push(ele);
          advance(matchTag[0].length);
        }
      } else {
        str = template.slice(0, textEnd);
        stack[stack.length - 1].children.push(str);
        advance(textEnd);
      }
    }
    function advance(n) {
      index += n
      template = template.substring(n);
    }
  }

  console.log(stack);
}


