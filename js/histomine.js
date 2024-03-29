HistoMine = (function() {
  var BATCH_SIZE = 500;
  var FETCH_URL = '/push/chromehistory-history/getCurrent';
  var urls = {};
  var stack = [];

  function init() {
    $.getJSON(FETCH_URL, {limit: BATCH_SIZE}, addBatch);
    $('#up').click(up);
  }

  function up(evt) {
    evt.preventDefault();
    var item = stack.pop();
    if (item) draw(item);
  }

  function addBatch(history) {
    $.each(history, function(i, item) {
      addUrl(item.url);
    });
    draw(urls);
  }

  var URL_EX = /https?:\/\/([^?#]*)/;
  function addUrl(url) {
    var match = url.match(URL_EX);
    if (!match) return;

    var pieces = match[1].split('/');

    addPieces(urls, pieces);
  }

  function addPieces(tree, pieces) {
    var first = pieces[0];
    if (!first || first.length === 0) return;

    var rest = pieces.slice(1);

    if (typeof tree[first] === 'undefined') {
      tree[first] = {
        name: first,
        count: 1,
        tree: {},
        parent: tree
      };
    } else {
      tree[first].count++;
    }

    addPieces(tree[first].tree, rest);
  }

  var MIN_FONT = 16;
  var MAX_FONT = 60;
  var FONT_RANGE = MAX_FONT - MIN_FONT;
  function draw(tree) {
    var range = countRange(urls);
    var min = range[0];
    var max = range[1];
    range = max - min;
    var list = $('#urls').html('');
    $.each(tree, function(i, node) {
      var percent = (node.count - min) / range;
      var size = MIN_FONT + Math.floor(FONT_RANGE * percent);
      list.append(
        $('<a>').
        attr('data-size', size).
        text(node.name).
        click(function(evt) {
          evt.preventDefault();
          stack.push(tree);
          draw(node.tree);
        })
      );
    });
    $('#cloud').tagcanvas({
      frontSelect: true,
      reverse: true,
      textColour: '#666',
      weight: true,
      weightFrom: 'data-size'
    }, 'urls');
  }

  function countRange(tree) {
    var max = 0;
    var min = 100000000000;
    $.each(tree, function(i, node) {
      if (node.count > max) max = node.count;
      if (node.count < min) min = node.count;
    });
    return [min, max];
  }

  return {
    init: init
  };
})();

$(HistoMine.init);
