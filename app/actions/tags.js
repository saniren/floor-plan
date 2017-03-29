export function saveTags(data, succesCallback) {
	$.ajax({
		url : "/tasks",
		type : "POST",
		data: JSON.stringify(data),
		dataType: "json",
		async: false,
		headers: { 'Content-Type': 'application/json' },
		success : succesCallback,
		error: function(error) {
			alert("Error in saving tasks:",error);
		}
	});
}


export function getLastActiveTag(succesCallback) {
  $.ajax({
    url : "/tags",
    type : "get",
    async: false,
    headers: { 'Content-Type': 'application/json' },
    success : succesCallback,
    error: function(err) {
      alert("No tag nearby ",err);
    }
  });
}