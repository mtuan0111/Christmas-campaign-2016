(function($) {
    $(document).on("click","a.group-name",function(){
      $(this).next("ul[data-group-name]").stop(true,false).slideToggle();
    })

    $(document).on("click","a.menu-btn",function(){
      $(this).next("nav").stop(true,false).slideToggle(200);
    })
})(jQuery);