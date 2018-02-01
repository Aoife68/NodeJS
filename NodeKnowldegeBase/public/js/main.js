$(document).ready(()=>{
  $('.delete-article').on('click', (event)=>{
    $deleteTarget =$(event.target);//get instance from client side
    const id =$deleteTarget.attr('data-id');//assign id from instance
    $.ajax({
      type:'Delete',
      url:'/articles/'+id, //id from above variable
      success: function(response){
        alert('Deleting Article');
        window.location.href='/';
      },//end success function
      error: function(err){
        console.log('Ajax error:' +err);
      }
    });//end ajax function
  });//end on click
});//end document ready
