function funkcja_zwrotna() {
    var pole_tekstowe_value = document.forms[0].elements.pole_tekstowe.value;
    var pole_liczbowe_value = document.forms[0].elements.pole_liczbowe.value;

    // Konwersja wartości na liczby przy użyciu parseFloat
    var pole_tekstowe_number = parseFloat(pole_tekstowe_value);
    var pole_liczbowe_number = parseFloat(pole_liczbowe_value);

    // Sprawdzenie czy konwersja się powiodła
    if (!isNaN(pole_tekstowe_number)) {
        console.log("wczytanaWartośćZPolaTekstowego:" + pole_tekstowe_number + ":" + typeof pole_tekstowe_number);
    } else {
        console.log("wczytanaWartośćZPolaTekstowego:" + pole_tekstowe_value + ":" + typeof pole_tekstowe_value);
    }

    if (!isNaN(pole_liczbowe_number)) {
        console.log("wczytanaWartośćZPolaNumerycznego:" + pole_liczbowe_number + ":" + typeof pole_liczbowe_number);
    } else {
        console.log("Nieprawidłowa wartość w polu liczbowym");
    }

    if ((!isNaN(pole_liczbowe_number)) && (!isNaN(pole_tekstowe_number))) {
        console.log("suma liczb to:" + (pole_tekstowe_number+pole_tekstowe_number));
    } 
}
