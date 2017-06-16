function checkVersion(version, challenger){
	let range = challenger.split("->").map(e => e.split(".").join(""));
	let comp = version.split(".").join("");
	if(range.length == 1){
		return range[0].substr(0,1) == "^" ? parseInt(range[0].substr(1)) <= comp : range[0] == comp;
    } else if(range.length == 2){
		return range[0] <= comp && comp <= range[1];
    } else {
		return false;
    }
}
