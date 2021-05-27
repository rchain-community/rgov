/*Attach vote function to click on selectable cells*/

Array.from(document.getElementsByClassName('selectable')).forEach(element => {
    element.onclick = vote;
});

function vote(e){
    console.log(isSelected(e.target));
    console.log(e.target);
    console.log(getEnvelopeDiv(e.target));
}

function isSelected(div){
    if (div.classList.contains("selected"))
        return true
    else
        return false
}

function getEnvelopeDiv(target){
    console.log(target)
    if (target.nodeName === "TD")
        m.render(target,m("i",{class:"envelope green icon"}))
}