/*Attach vote function to click on selectable cells*/

// Array.from(document.getElementsByClassName('selectable')).forEach(element => {
//     element.onclick = setEnvelopeColor;
// });

var mainContent = document.getElementById('main-content');

let state = {
    number: 0
}

const issues = [
    {id:0,desc:"Bla"},
    {id:1,desc:"Blabla"}
];

const incr = () => {
    state = { ...state, number: state.number + 1 }
}

const header = m("thead", [
                    m("tr",[
                        m("th", {class: "table-icon"}),
                        m("th", {class: "table-title"}, "Issues"),
                        m("th"),
                        m("th"),
                        m("th")
                        
                    ])
                ])

const body = m("tbody", issues.map(issue => {

   return m("tr",[
        m("th", {class : "id-cell"}, issue.id),
        m("th", {class: "issue-description"}, issue.desc),
        m("th"),
        m("th"),
        m("th")
        
    ])
}))

                
            
    





const Root = { 
    view: () => {
        return m("table", {class: "ui celled table styled-table"}, [
            header,
            body
        ])
    }
}
m.mount(mainContent, Root);


function setEnvelopeColor(e){
    e.preventDefault();
    let envelopeFunction;
    let envelopeRow;

    if (e.target.nodeName === "TD")
        return

    else if (e.target.nodeName === "A") {
        envelopeFunction = getEnvelopeFunction(e.target);
        envelopeRow = getEnvelopeRow(e.target);
        changeColor(e.target, envelopeFunction, envelopeRow);
    }
    
    else {
        envelopeFunction = getEnvelopeFunction(e.target.parentNode);
        envelopeRow = getEnvelopeRow(e.target.parentNode);
        changeColor(e.target.parentNode,envelopeFunction,envelopeRow)
    }

}


function isSelected(div){
    if (div.classList.contains("selected"))
        return true
    else
        return false
}


function changeColor(aDiv, envelopeFunction,envelopeRow){
    console.log(aDiv)

    //Checking if the envelope is already selected
    if ( isSelected( getChildDiv(aDiv) ) )
        return

    unSelectOtherEnvelope(getChildDiv(aDiv), envelopeRow);

    console.log("render in " , aDiv)
    m.render(aDiv,m("i",{class:"envelope icon selected " + envelopeFunction}));
}

function unSelectOtherEnvelope(env, row){

    Array.from(document.getElementsByClassName('envelope')).forEach(element => {

        if ( getEnvelopeRow(element.parentNode) === row && element.classList.contains("selected") ) {
            console.log(element.classList)
            //element.classList.remove("selected");
            element.classList.replace("selected","icon2");
            element.classList.replace("icon","outline");
            element.classList.replace("icon2","icon");
            //element.classList = "envelope outline icon " + oldFunction;
            //element.classList.remove("selected");
            console.log(element.classList)


        }

    });
    
}

function getEnvelopeFunction(aDiv){
    const childDiv = getChildDiv(aDiv);


    if (childDiv.classList.contains("oppose"))
        return "oppose"
    else if (childDiv.classList.contains("abstain"))
        return "abstain"
    else if (childDiv.classList.contains("support"))
        return "support"
    else
        return null
}

function getEnvelopeRow(aDiv){

    const rowId = aDiv.parentNode.parentNode.getAttribute("value");

    return rowId;

}

function getChildDiv(div){

    if (div.childNodes.length === 3)
        return div.childNodes[1]
    else if (div.childNodes.length === 1)
        return div.childNodes[0]
    else 
        return undefined
}