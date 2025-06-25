
# EasyCsvPDF

Simple JS Script/Library for generating PDF files from CSV files and customizing their format.



## Usage

Requires [jsPDF](https://github.com/parallax/jsPDF).

Customization can be done combining this tags in the "format.card_rows" variable if the format of the document is set to "cards".





```
  !TITLES         -> Prints all titles, one column per title.
  !DATA           -> Prints all the data of the current row, one column per value.
  ![DATA NAME]    -> Prints a specific value from the current row in a new column. EX:  !NAME -> "John Doe"
  !SPACE          -> Prints and empty space that by default opcuies one column.
  [TEXT]          -> Not putting a "!" at the start results in the same text printed in that column.
Avaliable modifiers are:
  '#'             -> Putting a '#' at the start will print said column in bold text. EX: #!TITLES, #TEXT, #!NAME
  ':[number]'     -> Putting a ':' followed by a number sets the span/number of columns this value will ocuppy.

  With '!TITLES' and '!DATA!' defines the span of each created column.
  With '[TEXT]', '!COLNAME' and '!SPACE' sets the span just for the value.
  Using a '0' as the number results in the value not creating a new column after it, concatenating itself to the next column and using the span of the next column. 
  This can be used to chain values.
    EX:   !TITLES/!DATA:2                         -> Column per value, each spanning two columns. Same fo
          !TITLES/!DATA:0                         -> One single column, all values printed one after the other.
          ![DATA]/[!Space]/[TEXT]:2               -> One value spanning two columns
          ![ANYTHING1]:0 + ![ANYTHING2]           -> One column, with two values one after the other
          ![ANY]:0 + ![ANY2]:0 + ...  + ![ANYN]:1 -> One column, with n values one after the other
          ![ANY]:0 + ![ANY2]:0 + ...  + ![ANYN]:3 -> Three columns, with n values one after the other




```
