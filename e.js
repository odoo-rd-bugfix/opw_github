// ==UserScript== //
// @name opw_github
// @match *://github.com/odoo/*
// @match *://github.com/odoo-dev/*
// @match *://github.com/pulls/*
// ==/UserScript==

const insertAfter = (new_node, ref_node) => {
  ref_node.parentNode.insertBefore(new_node, ref_node.nextSibling);
}


const addOPWCopyButton = () => {
  if (document.querySelector('.opw-copy')) return;

  document.querySelectorAll("span clipboard-copy").forEach(el => {
    const el_copy = el.cloneNode(true);
    const svg = el_copy.querySelector('svg');
    const value = el_copy.getAttribute('value');

    if (!~value.indexOf(':')) return;

    svg.style.color = 'green';
    el_copy.setAttribute('value', value.substr(value.indexOf(':') + 1));
    el_copy.classList.add('opw-copy');
    el.parentElement.appendChild(el_copy);
  });
}

const addOPWLinks = () => {
  const treat = node => {
    switch(node.nodeType) {
      case 3:
        break;
      case 1:
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
            treat(node.childNodes[i]);
        }
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

  document.querySelectorAll(".comment-body:not([data-opw-handled]),.commit-desc:not([data-opw-handled])").forEach(n => {
    n.setAttribute('data-opw-handled', 1);
    treat(n)
  })
}

const addCommitDirectClick = () => {
  if (document.querySelector('a.TabNav-item.selected[href$="/commits"]')) {
    let commits = document.querySelectorAll('.Timeline-Item');
    if (commits.length === 1) {
        commits[0].querySelector('a').click();
    }
  }
}
window.addEventListener('turbo:load', () => {
  //replace opw-1234 by a link to the odoo.comtask:
  addOPWLinks();
  //add copy to clipboard button without remote:
  addOPWCopyButton();
  //direct click on commit tab if only one commit
  addCommitDirectClick();
});
