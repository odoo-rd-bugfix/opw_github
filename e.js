// ==UserScript== //
// @name opw_github
// @match *://github.com/odoo/*
// @match *://github.com/odoo-dev/*
// @match *://github.com/pulls/*
// ==/UserScript==

const insertAfter = (new_node, ref_node) => {
  ref_node.parentNode.insertBefore(new_node, ref_node.nextSibling);
}
window.navigation.addEventListener('navigate', (event) => {
    if (event.destination.url.match(/github\.com\/odoo(-dev)?/)) {
        setTimeout(opwHandle, 1400);
    }
});
const addOPWCopyButton = () => {
  if (document.querySelector('.opw-copy')) return;

  document.querySelectorAll('div[class^="prc-PageHeader-Description"] button[data-component="IconButton"]').forEach(el => {
    const el_copy = el.cloneNode(true);
    const svg = el_copy.querySelector('svg');
    svg.style.color = 'green';
    el_copy.classList.add('opw-copy');
    el.parentElement.appendChild(el_copy);
    el_copy.onclick = () => {
      navigator.clipboard.writeText(document.querySelectorAll('a[class^="PullRequestBranchName-module__truncateBranch"]')[1].getAttribute('href').split('/').slice(-1)[0]);
      svg.style.color = 'blue';
    }
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

  document.querySelectorAll(".comment-body:not([data-opw-handled]),.commit-desc:not([data-opw-handled]),span[class^='Text__StyledText-sc'].text-mono").forEach(n => {
    n.setAttribute('data-opw-handled', 1);
    treat(n)
  })
}

const addCommitDirectClick = () => {
  if (document.querySelector('a.TabNav-item.selected[href$="/commits"]')) {
    let commits = document.querySelectorAll('[data-testid="commit-row-item"]');
    if (commits.length === 1) {
        commits[0].querySelector('a').click();
    }
  }
}
function opwHandle () {
  //replace opw-1234 by a link to the odoo.comtask:
  addOPWLinks();
  //add copy to clipboard button without remote:
  addOPWCopyButton();
  //direct click on commit tab if only one commit
  addCommitDirectClick();
}
window.addEventListener('turbo:load', opwHandle);
