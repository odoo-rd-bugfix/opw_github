function insertAfter(new_node, ref_node) {
  ref_node.parentNode.insertBefore(new_node, ref_node.nextSibling);
}
function treat(node) {
  switch(node.nodeType) {
    case 3:
      break;
    case 1:
      [].slice.call(node.childNodes).forEach(treat);
    default:
      return;
  }
  var oval = node.nodeValue;
  if (oval.indexOf("opw") == -1 && oval.indexOf("OPW") == -1) {
    return;
  }
  var done_offset = 0;
  oval.replace(/\b(opw[: -] ?)(\d{6,})\b/gi, function(match, prefix, num, offset) {
    var link = document.createElement("a");
    link.setAttribute("href", "https://www.odoo.com/web#id=" + ( num < 1E6 ? 1E6 + +num : num ) + "&view_type=form&model=project.task");
    link.appendChild(document.createTextNode(num));
    node.nodeValue = oval.slice(done_offset, offset + prefix.length);
    done_offset = offset + match.length;
    insertAfter(link, node);
    node = document.createTextNode(oval.slice(done_offset));
    insertAfter(node, link);
  });
}
[].slice.call(document.querySelectorAll(".comment-body,.commit-desc")).forEach(treat);
