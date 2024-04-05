// ==UserScript== //
// @name opw_github
// @match *://github.com/odoo/*
// @match *://github.com/odoo-dev/*
// ==/UserScript==

const insertAfter = (new_node, ref_node) => {
  ref_node.parentNode.insertBefore(new_node, ref_node.nextSibling);
}
const treat = node => {
  switch(node.nodeType) {
    case 3:
      break;
    case 1:
      node.childNodes.forEach(treat);
    default:
      return;
  }
  const oval = node.nodeValue;
  if (!/opw|task/i.test(oval)) {
    return;
  }
  let done_offset = 0;
  oval.replace(/\b((?:opw|task)(?: id)?[: #-] ?)(\d{5,})\b/gi, function(match, prefix, num, offset) {
    const link = document.createElement("a");
    num = prefix[0].toLowerCase() == 'o' && num < 1E6 ? 1E6 + +num : num;
    link.setAttribute("href", "https://www.odoo.com/web#id=" + num + "&view_type=form&model=project.task");
    link.appendChild(document.createTextNode(num));
    node.nodeValue = oval.slice(done_offset, offset + prefix.length);
    done_offset = offset + match.length;
    insertAfter(link, node);
    node = document.createTextNode(oval.slice(done_offset));
    insertAfter(node, link);
  });
}
const treat_all = () => {
  document.querySelectorAll(".comment-body:not([data-opw-handled]),.commit-desc:not([data-opw-handled])").forEach(n => {
    n.setAttribute('data-opw-handled', 1);
    treat(n)
  })
  //add copy to clipboard button without remote:
  document.querySelectorAll("clipboard-copy").forEach(
    (el) => {
        if(el.value.includes("odoo-dev")) {
            const svg = el.querySelector('svg');
            if (svg.style.color == "red") return;
            const el_copy = el.cloneNode(true);
            const value = el_copy.getAttribute('value');

            el_copy.setAttribute('value', value.substr(value.indexOf(':') + 1));
            el.parentElement.appendChild(el_copy);
            svg.style.color = 'red';
        }
    }
  );

  if (document.querySelector('a.tabnav-tab.selected[href$="/commits"] #commits_tab_counter[title="1"]')) {
    let commits = document.querySelectorAll('.TimelineItem-body a.Link--primary');
    if (commits.length === 1) {
        commits[0].click();
    }
  }
};
window.addEventListener('turbo:load', treat_all);
