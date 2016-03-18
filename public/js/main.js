'use strict';
$(function () {
  $('#apisearch').keyup(function () {
    var search_term = $(this).val();
    $.ajax({
      url: '/api/search',
      method: 'POST',
      data: {
        search_term: search_term
      },
      dataType: 'json',
      success: function (json) {
        let data = json.hits.hits.map(function (hit) {
          return hit;
        });
        $('#apiresults').empty();
        for (var i = 0; i < data.length; i++) {
          var html = '';
          html += '<div class="col-md-4">';
          html += '<a href=" /product/' + data[i]._id + '">';
          html += '<div class="thumbnail">';
          html += '<img src="' + data[i]._source.image + '" alt="' + data[i]._source.name + 'image">';
          html += '<div class="caption">';
          html += '<h3>' + data[i]._source.name + '</h3>';
          html += '<p>' + data[i]._source.category.name + '</p>';
          html += '<p>$' + data[i]._source.price + '</p>';
          html += '</div>';
          html += '</div>';
          html += '</a>';
          html += '</div>';

          $('#apiresults').append(html);

        }
      },
      error: function (error) {
        console.log(error);
      }
    });
  });
  $('#apisearch input').blur(function () {
    if (!$(this).val()) {
      location.reload();
    }
  });
});