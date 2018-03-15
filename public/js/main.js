$(document).ready(()=>{
	$('.deleteUsr').on('click', deleteUsr);
});

function deleteUsr(){
	const confirmation = confirm("Are Ypu Sure?");
	
	if(confirmation){
		$.ajax({
			type:'DELETE',
			url:'/users/delete/' +$(this).data('id')
		}).done((response)=>{
			window.location.replace('/');
		});
		window.location.replace('/');
	} else {
		return false;
	}
}