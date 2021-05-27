/*Attach vote function to click on selectable cells*/

// Array.from(document.getElementsByClassName('selectable')).forEach(element => {
//     element.onclick = setEnvelopeColor;
// });

var tableDiv = document.getElementById('table');

let state = {
    issues:[]
}

const issues = [
    {id:0,desc:"Bla"},
    {id:1,desc:"Blabla"}
];


const tableHeader = m("thead", [
                    m("tr",[
                        m("th", {class: "table-icon"}),
                        m("th", {class: "table-title"}, "Issues"),
                        m("th","Support"),
                        m("th","Abstain"),
                        m("th","Oppose")
                        
                    ])
                ])

const tableBody = m("tbody", issues.map(issue => {

   return m("tr",[
        m("td", {class : "id-cell"}, issue.id),
        m("td", {class: "issue-description"}, issue.desc),
        m("td", {class:"selectable"}, [
            m("a", {class:"voting-link"},[
                m("i",{class:"envelope outline icon support"})
            ])
        ]),
        m("td", {class:"selectable"}, [
            m("a", {class:"voting-link"},[
                m("i",{class:"envelope outline icon abstain"})
            ])
        ]),
        m("td", {class:"selectable"}, [
            m("a", {class:"voting-link"},[
                m("i",{class:"envelope outline icon oppose"})
            ])
        ])
        
    ])
}))

                
        
const Table = { 
    view: () => {
        return m("table", {class: "ui celled table styled-table"}, [
            tableHeader,
            tableBody
        ])
    }
}
m.mount(tableDiv, Table);


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