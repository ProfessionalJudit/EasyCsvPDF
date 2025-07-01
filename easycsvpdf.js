/**
 * Description placeholder
 *
 * @type {*}
 */
let jsPDF;
if (typeof window !== 'undefined' && window.jspdf) {
    jsPDF = window.jspdf.jsPDF;
} else {
    jsPDF = require('jspdf').jsPDF;
}
/**
 * EasyCsvPdf
 * @class
 */
class EasyCsvPdf {
    /**
     * jsPDF Document, measuring unit set as "px"
     * Changing the measuring unit from "px" to anything else will break things!
     * @type {jsPDF} 
     * @public
     */
    doc = new jsPDF({ unit: "px" });
    /**
     * Document width, in pixels
     * @type {number}
     */
    doc_width = this.doc.internal.pageSize.getWidth();
    /**
     * Document height, in pixels
     * @type {number}
     */
    doc_height = this.doc.internal.pageSize.getHeight();

    /**
     * CSV that holds the data to generate the pdf.
     * Any separator between columns is okay as long as it gets specified in the constructor
     * @type {string}
     */
    csv = "";
    /**
     * Open the doc in a new window?.
     * @type {boolean}
     */
    new_window = false;
    /**
     * CSV file split in lines, one line per index, set at the constructor.
     * Changing this variable manually might break things and won't set the correct column names when printing!
     * @type {string[]}
     */
    lines = [];
    /**
     * CSV Column names split into an array, one per index.
     * @type {string[]}
     */
    titles = [];
    /**
     * CSV Column names split into an array, one per index, all in uppercase.
     * This is used when getting data from a column in a specific row, changing manually will break things!
     * @type {string[]}
     */
    titles_upper = [];
    /**
     * X cordinate used when printing data to the pdf
     * Manually altering it might break things and result in undefined behavior.
     * It gets calculated "deterministicly" in most printing functions.
     * @type {number}
     */
    x = 0;
    /**
     * Y cordinate used when printing data to the pdf
     * Manually altering will break things!
     * Gets gradually increased in most printing functions 
     * @type {number}
     */
    y = 0;
    /**
     * Character/s that separate the columns in the CSV.
     * @type {string}
     */
    separator = ",";
    /**
     * Customization parameters for the pdf
     * @param {string} title
     * Title of the document. Used for the filename, and printing the headers of the pages.
     * @param {string} type
     * Type of pdf: 
     * Cards: Prints all data in a format resembling typical html cards. How and what gets printed in each card can be customized.
     * MORE TODO!!!
     * @param {string} background_color
     * Document background color. TODO!!!
     * @param {string} background_color_alt
     * Document background highlight color. TODO!!!
     * @param {boolean} alternate_backgrounds
     * Sets document to alternate background colors when printing cards. TODO!!!
     * @param {string} card_separators
     * What to print between cards.
     * line: Horizontal line
     * empty: nothing TODO!!!
     * @param {number} card_spacing
     * In "px", spacing between cards.
     * @param {string[][]} card_rows
     * Important! This parameter defines what data the cards print, how it getts printed, and where!
     * Each index in the first array defines a new row inside the card, and each index in the second array is a column.
     * Avaliable options are:
     * 
     *  !TITLES         -> Prints all titles, one column per title.
     * 
     *  !DATA           -> Prints all the data of the current row, one column per value.
     * 
     *  ![DATA NAME]    -> Prints a specific value from the current row in a new column. EX: !NAME -> "John Doe"
     * 
     *  !SPACE          -> Prints and empty space that by default opcuies one column.
     * 
     *  [TEXT]          -> Not putting a "!" at the start results in the same text printed in that column.
     * 
     * Avaliable modifiers are:
     * 
     *  '#'             -> Putting a '#' at the start will print said column in bold text. EX: #!TITLES, #TEXT, #!NAME
     * 
     *  '@'             -> Putting a '#' at the start will draw a rectangle arround the text. EX: @!TITLES, @TEXT, @!NAME
     * 
     *  ':[number]'     -> Putting a ':' followed by a number sets the span/number of columns this value will ocuppy.
     * 
     *                     With '!TITLES' and '!DATA!' defines the span of each created column.
     *                     With '[TEXT]', '!COLNAME' and '!SPACE' sets the span just for the value.
     *                     Using a '0' as the number results in the value not creating a new column after it, 
     *                     concatenating itself to the next column and using the span of the next column. 
     *                     This can be used to chain values.
     *                     EX:  !TITLES/!DATA:2                         -> Column per value, each spanning two columns. Same fo
     * 
     *                          !TITLES/!DATA:0                         -> One single column, all values printed one after the other.
     * 
     *                          ![DATA]/[!Space]/[TEXT]:2               -> One value spanning two columns
     * 
     *                          ![ANYTHING1]:0 + ![ANYTHING2]           -> One column, with two values one after the other
     * 
     *                          ![ANY]:0 + ![ANY2]:0 + ...  + ![ANYN]:1 -> One column, with n values one after the other
     * 
     *                          ![ANY]:0 + ![ANY2]:0 + ...  + ![ANYN]:3 -> Three columns, with n values one after the other
     * 
     * 
     * @param {number} margin
     * Marin on the sides and top/bottom of the document.
     * @param {number} card_column_separation
     * Spacing between columns.
     *
     * @type {{ title: string; type: string; background_color: string; background_color_alt: string; alternate_backgrounds: boolean; card_separators: string; card_spacing: number; card_rows: {}; margin: number; card_column_separation: number; }}
     */
    format = {
        title: "title",
        type: "",
        background_color: "white",
        background_color_alt: "white",
        alternate_backgrounds: false,
        card_separators: "line",
        card_spacing: 10,
        card_rows: [
            ['#!TITLES'],
            ["!DATA"],

        ],
        text_size: 6,
        overflow: "push", // "Push" -> augment y cordinate, "none" -> do nothing
        margin: 20,
        card_column_separation: 5, //Separation between columns in a card
        card_row_separation: 0 //Separation between rows in a card

    };

    /**
     * Creates an instance of EasyCsvPdf.
     * @constructor
     * @param {string} csv String containing the entirety of the csv
     * @param {string} [title="title"] Title of the document
     * @param {string} [separator=","] Separator between the columns in the csv
     * @param {string} [type="CARDS"] The type of the pdf that will be created
     */
    constructor(csv, title = "title", separator = ",", type = "CARDS") {
        this.csv = csv;
        this.separator = separator;
        this.title = title;
        this.lines = csv.split("\n").filter(line => line.trim() !== "");
        this.titles = this.lines[0].split(this.separator);
        if (this.titles[this.titles.length - 1] == undefined || this.titles[this.titles.length - 1] == "") {
            this.titles = this.titles.slice(0, this.titles.length - 1)
        }
        if (this.lines[this.lines.length - 1] == undefined || this.lines[this.lines.length - 1] == "") {
            this.lines = this.lines.slice(0, this.lines.length - 1)
        }
        console.log(this.lines[this.titles.length - 1])
        this.titles_upper = this.titles.map(function (x) { return x.toUpperCase(); })
        //Format
        this.format.type = type;
        if (this.format.type != "CARDS" && this.format.type != "REPORT" && this.format.type != "TABLE") {
            this.format.type = "CARDS";
        }
        console.log(this.doc_width, " <- w:h -> ", this.doc_height)
    }

    /**
     * Retrieves the column title at the specified index from the CSV data
     * @param {number} [index=0] 
     */
    getColumnTitle(index = 0) {
        if (index >= 0 && index < this.titles.length) {
            return this.titles[index];
        }
        if (index < 0) {
            return "[error]: index is lower than valid index";
        }
        if (index >= this.titles.length) {
            return "[error]: index is greather than valid index";
        }

    }
    /**
     * Retrieves the line at the specified index from the CSV data, starts with 0
     * @param {number} [index=0] 
     */
    getData(index = 0) {
        if (index + 1 == 0) {
            return "[error]: index is lower than valid index";
        }
        if (index + 1 >= this.lines.length) {
            return "[error]: index is greather than valid index";
        }

        if (index + 1 < this.lines.length) {
            return this.lines[index + 1];
        }

    }
    /**
     * Description placeholder
     * TODO!!!
     * @param {{}} [row=[]] 
     */
    getCardColumnWidth(row = []) {

    }
    /**
     * Prints an individual row. Gets used in the 'createCard()' function
     * @param {{}} [data=[]] Data this row/card has. Ex: ['john doe','32','182']
     * @param {{}} [row_format=[]] Format this row has. Ex: ['!NAME','!AGE','!HEIGHT:0','cm:1']
     */
    createCardRow(data = [], row_format = []) {
        let column_count = 0;
        let column_width = 0;
        this.x = this.format.margin;
        this.y += this.format.text_size / 2;
        this.y += this.format.card_row_separation / 2;
        //Count number of columns, and set widths
        for (let i = 0; i < row_format.length; i++) {
            const element_noclean = row_format[i].split(':');
            const element = row_format[i].split(':');
            element[0] = element[0].replace("#", "")
            element[0] = element[0].replace("@", "")
            //Check if span is specified
            if (element.length > 1) {
                //Check if valid/user wants a ":" character
                if (parseInt(element[element.length - 1]) != NaN && parseInt(element[element.length - 1]) >= 0) {
                    if (element[0] == "!TITLES" || element[0] == "!DATA") {
                        column_count += parseInt(element[element.length - 1]) * this.titles;
                    } else {
                        column_count += parseInt(element[element.length - 1]);
                    }
                } else {
                    column_count++;
                }
            } else if (element.length == 1) {
                if (element[0] == "!TITLES" || element[0] == "!DATA") {
                    column_count += this.titles.length;
                } else if (element[0] == "!SPACE") {
                    column_count++;
                } else {
                    column_count++;
                }

            }

        }
        column_width = (this.doc_width - (this.format.card_column_separation * column_count) - this.format.margin * 2) / column_count;
        //console.log("COUNT = ",column_count);

        var current_column = 0;
        var text_nospan = "";
        var text_nospan_amount = 0;

        for (let i = 0; i < row_format.length; i++) {
            const element = row_format[i].split(':');
            var print_rect = (element[0] != element[0].replace("@", ""));
            element[0] = element[0].replace("@", "");
            if (element[0].charAt(0) == "#") {
                this.doc.setFontSize(this.format.text_size);
                this.doc.setFont("helvetica", "normal", "bold");
            } else {
                this.doc.setFontSize(this.format.text_size);
                this.doc.setFont("helvetica", "normal", "normal");
            }
            element[0] = element[0].replace("#", "")

            let element_span = (Number.isNaN(parseInt(element[element.length - 1]))) ? 1 : parseInt(element[element.length - 1]);
            element_span = (element_span < 0) ? 1 : element_span;
            this.x = column_width * current_column;
            this.x += this.format.margin;
            this.x += this.format.card_column_separation * (current_column + 1);


            if (text_nospan_amount == 0) {
                text_nospan = ""
            }

            if (element[0] == "!TITLES" || element[0] == "!DATA") {
                let length = 0;
                let texts = [""];
                texts = (element[0] == "!TITLES") ? this.titles : (element[0] == "!DATA") ? data : [""];
                length = (element[0] == "!TITLES") ? this.titles.length : (element[0] == "!DATA") ? data.length : 1;
                if (element_span > 0 && text_nospan_amount == 0) {
                    for (let j = 0; j < length; j++) {
                        this.x = column_width * current_column;
                        this.x += this.format.margin;
                        this.x += this.format.card_column_separation * (current_column + 1);
                        this.doc.text(texts[j], this.x, this.y, { maxWidth: column_width * element_span });
                        if (print_rect) {
                            this.doc.rect(this.x, this.y - this.format.text_size + this.format.text_size / 3
                                , column_width * element_span + (element_span - 1) * this.format.card_column_separation, this.format.text_size - this.format.text_size / 7)
                        }
                        current_column += element_span;
                        text_nospan = text_nospan + element[0];
                    }
                } else {
                    for (let j = 0; j < length; j++) {
                        text_nospan = text_nospan + texts[j];
                        text_nospan_amount++;

                    }
                }
            } else if (element[0].charAt(0) == "!") {

                const col_name = element[0].split("!")[1]
                let data_index = this.titles_upper.indexOf(col_name.toUpperCase())
                if (element_span > 0 && text_nospan_amount == 0) {
                    if (data_index != -1) {
                        text_nospan = text_nospan + element[0];
                        if (data[data_index] != null && data[data_index] != undefined) {
                            this.doc.text(data[data_index], this.x, this.y, { maxWidth: column_width * element_span });
                            if (print_rect) {
                                this.doc.rect(this.x, this.y - this.format.text_size + this.format.text_size / 3,
                                    column_width * element_span + (element_span - 1) * this.format.card_column_separation, this.format.text_size - this.format.text_size / 7)
                            }
                        }
                    } else {
                        //console.log(current_column, "/", column_count, ":", "space", element_span)
                        //this.doc.text("space", this.x, this.y, { maxWidth: column_width * element_span });
                        if (print_rect) {
                            this.doc.rect(this.x, this.y - this.format.text_size + this.format.text_size / 3
                                , column_width * element_span + (element_span - 1) * this.format.card_column_separation, this.format.text_size - this.format.text_size / 7)
                        }
                    }
                    current_column += element_span;
                } else {
                    text_nospan_amount++;

                    if (data_index != -1 && data[data_index] != undefined) {
                        text_nospan = text_nospan + data[data_index];
                    } else {
                        //text_nospan = text_nospan + "spacef";
                    }

                }
            } else {
                if (element_span > 0 && text_nospan_amount == 0) {
                    this.x = column_width * current_column;
                    this.x += this.format.margin;
                    this.x += this.format.card_column_separation * (current_column + 1);
                    if (element[0] != null) {
                        this.doc.text(element[0], this.x, this.y, { maxWidth: column_width * element_span });
                        if (print_rect) {
                            this.doc.rect(this.x, this.y - this.format.text_size + this.format.text_size / 3, column_width * element_span + (element_span - 1) * this.format.card_column_separation, this.format.text_size - this.format.text_size / 7)
                        }
                    }
                    // console.log(current_column, "/", column_count, ":", element[0], element_span)
                    current_column += element_span;

                } else {
                    text_nospan_amount++;
                }
                text_nospan = text_nospan + element[0];
            }
            if (element_span > 0) {
                if (text_nospan_amount > 0) {
                    text_nospan_amount = 0;
                    // console.log(text_nospan)
                    this.doc.text(text_nospan, this.x, this.y, { maxWidth: column_width * element_span });
                    current_column += element_span;
                    if (print_rect) {
                        this.doc.rect(this.x, this.y - this.format.text_size + this.format.text_size / 3, column_width * element_span + (element_span - 1) * this.format.card_column_separation, this.format.text_size - this.format.text_size / 7)
                    }
                }
            }


        }
        //this.y += this.format.text_size / 2;
        this.y += this.format.card_row_separation / 2;
    }
    /**
     * Prints a new card with the specified data
     * @param {{}} [data=[]] Data this card has. Ex: ['john doe','32','182']
     */
    createCard(data = []) {
        for (let i = 0; i < this.format.card_rows.length; i++) {
            const row_format = this.format.card_rows[i];
            this.createCardRow(data, row_format);
            if (i < this.format.card_rows.length - 1) {
                this.y += 4;
            }
        }
        this.createCardSpacing();
        if (this.y + 35 > this.doc_height) {
            this.doc.addPage();
            this.doc.setFont("helvetica", "normal", "bold");
            this.doc.setFontSize(this.format.text_size + this.format.text_size / 3);
            this.y = this.format.margin;
            this.x = this.format.margin;
            this.doc.text(this.x, this.y, this.title);
            this.createCardSpacing();

        }
    }


    /**
     * Description placeholder
     * TODO!!!
     * @param {number} [height=30] 
     */
    createEmptySpace(height = 30) {

    }

    /** Print the spacing between 2 cards */
    createCardSpacing() {
        if (this.format.card_separators == "line") {
            this.y += this.format.card_spacing / 2;
            this.doc.line(this.format.margin, this.y, this.doc_width - this.format.margin, this.y)
            this.y += this.format.card_spacing / 2;
        }
    }

    /** Prints a card per each row the CSV has */
    createCards() {
        this.createCardSpacing();
        //console.log(this.lines[0])
        for (var i = 1; i < this.lines.length; i++) {
            const line = this.lines[i];
            this.createCard(line.split(this.separator));
        }

    }

    /** Creates a pdf
     * TODO!!! CHANGING FILENAME
     */
    createPdf() {
        this.doc.setFont("helvetica", "normal", "bold");
        this.doc.setFontSize(this.format.text_size + this.format.text_size / 3);
        //console.log(this.doc.getFontList());
        this.y = this.format.margin;
        this.x = this.format.margin;
        this.doc.text(this.x, this.y, this.title);
        if (this.format.type == "CARDS") {
            this.createCards();
        }
        if(this.new_window){
            window.open(this.doc.output('bloburl'))

        }else{
            this.doc.save("test.pdf");
        }
    }


    /**
     * Manually save and download the pdf. Gets called in the "createPdf()" method.
     * @param {string} [filename="test.pdf"] Filename
     */
    savePdf(filename = "test.pdf") {
        this.doc.save(filename);
    }

}

if (typeof window === 'undefined') {
    module.exports = EasyCsvPdf;
} else {
    window.EasyCsvPdf = EasyCsvPdf;
}