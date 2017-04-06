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
			alert("Error in saving tasks ",error);
		}
	});
}
export function updateTag(data, succesCallback) {
	$.ajax({
		url : "/tasks",
		type : "PUT",
		data: JSON.stringify(data),
		dataType: "json",
		async: false,
		headers: { 'Content-Type': 'application/json' },
		success : succesCallback,
		error: function(error) {
			alert("Error in update task ",error);
		}
	});
}

export function getTagList(data, succesCallback) {
	$.ajax({
		url : "/tasks",
		type : "GET",
		async: false,
		headers: { 'Content-Type': 'application/json' },
		success : succesCallback,
		error: function(error) {
			alert("Error in getting tasks ",error);
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

export function getTagById(url, data, succesCallback) {
	$.ajax({
		url : url,
		type : "GET",
		async: false,
		headers: { 'Content-Type': 'application/json' },
		success : succesCallback,
		error: function(error) {
			alert("Error in getting given tag ",error);
		}
	});
}
