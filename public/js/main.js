'use strict';
$(function () {

  Stripe.setPublishableKey('pk_test_P6JY1TaYnTg4DLgALvTzMSJH');

  var opts = {
    lines: 11, // The number of lines to draw
    length: 42, // The length of each line
    width: 14, // The line thickness
    radius: 48, // The radius of the inner circle
    scale: 0.5, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#000', // #rgb or #rrggbb or array of colors
    opacity: 0.25, // Opacity of the lines
    rotate: 0, // The rotation offset
    direction: -1, // 1: clockwise, -1: counterclockwise
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    position: 'absolute' // Element positioning
  };

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

  $(document).on('click', '#plus', function (e) {
    e.preventDefault();
    let priceValue = parseFloat($('#priceValue').val());
    let quantity = parseInt($('#quantity').val());

    priceValue += parseFloat($('#priceHidden').val());
    quantity += 1;

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);

  });

  $(document).on('click', '#minus', function (e) {
    e.preventDefault();

    let priceValue = parseFloat($('#priceValue').val());
    let quantity = parseInt($('#quantity').val());

    if (quantity == 1) {
      priceValue = parseFloat($('#priceHidden').val());
    } else {
      priceValue -= parseFloat($('#priceHidden').val());
      quantity -= 1;
    }



    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);

  });

  function stripeResponseHandler(status, response) {
    var $form = $('#payment-form');

    if (response.error) {
      // Show the errors on the form
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    } else {
      // response contains id and card, which contains additional card details
      var token = response.id;
      // Insert the token into the form so it gets submitted to the server
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
      // add progress spinner element
      var spinner = new Spinner(opts).spin();
      $('#loading').append(spinner.el);

      // and submit
      $form.get(0).submit();
    }
  }


  $('#payment-form').submit(function (event) {
    var $form = $(this);

    // Disable the submit button to prevent repeated clicks
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from submitting with the default action
    return false;
  });
});
// Stripe.com custom form