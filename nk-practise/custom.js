var setPersonalDetail = function (isShow) {
    if (isShow) {
        $("#arrow, #thirdsection").show();
        $('html, body').animate({
            scrollTop: $("#second-section").offset().top
        }, 1000);
    } else {
        $("#arrow, #thirdsection").hide();
    }
};

var checkSectionSelection = function () {
    var sectionCheckedCount = $('#second-section').find('input[type="checkbox"]:checked').length;
    var selectCount = 0;
    $('#second-section').find('select').each((index, elem) => {
        if ($(elem).val().length > 0) {
            selectCount += 1;
        }
    });
    if (sectionCheckedCount > 0 || selectCount > 0) {
        setPersonalDetail(true);
    } else {
        setPersonalDetail(false);
    }
};
var setBlockSelection = function (elem) {
    var $parentBlock = $(elem).closest('.product-block');
    var blockCheckedCount = $parentBlock.find('input[type="checkbox"]:checked').length;
    var isActive = 0;
    if (blockCheckedCount > 0) {
        isActive += 1;
    }
    $parentBlock.find('select').each((index, elem) => {
        if ($(elem).val().length > 0) {
            isActive += 1;
        }
    });
    if (isActive) {
        $parentBlock.addClass("newproductblock");
    } else {
        $parentBlock.removeClass("newproductblock");
    }
};
(function () {
    $(document).ready(function () {
        $("#second-section input[type='checkbox']").change(function () {
            setBlockSelection(this);
            checkSectionSelection();
        });

        $('#second-section select').change(function () {
            setBlockSelection(this);
            checkSectionSelection();
        });

        $("#arrow").click(function () {
            $('html, body').animate({
                scrollTop: $("#thirdsection").offset().top
            }, 2000);
        });
        // click of next button
        $('.next').click(function () {
            var firstname = $("#firstname").val();
            var lastname = $("#lastname").val();
            var email = $("#email").val();
            if (firstname == "" || lastname == "" || email == "") {
                alert("please fill the form fileds")
            }
            else {
                $("#fourthsection, #lastsection").show();
                $('html, body').animate({
                    scrollTop: $("#fourthsection").offset().top
                }, 2000);
            }
        });
    })
})()

