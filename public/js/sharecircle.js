$(document).ready(function () {

    var taskId,
        thisPage,
        checkboxDateVal = false,
        changeCheckboxDateVal = false;

    intThisPage();

    //初始化页面
    function intThisPage() {
        thisPage = 1;
        getPageCount();
    }

    //获得分享任务详细信息并弹出修改对话框
    function changeButton() {
        $("[id^=intChangeShareTask-]").click(function () {
            taskId = $(this).val();
            $.getJSON("/getShareTaskById/" + $(this).val() + "?time=" + new Date().getTime(), function (data) {
                var task = eval(data);
                $("#changeShareAuthor").val(task.username);
                $("#changeShareTitle").val(task.title);
                $("#changeShareDescription").val(task.description);
                $("#changeShareTagOne").val(task.tags[0]);
                $("#changeShareTagTwo").val(task.tags[1]);
                $("#changeShareTagThree").val(task.tags[2]);
            });
        });
    }

    //删除分享任务按钮
    function deleteButton() {
        $("[id^=deleteShareTask-]").click(function () {
            if (confirm("确认删除？")) {
                taskId = $(this).val();
                $.post("deleteShareTaskById/" + taskId + "?time=" + new Date().getTime(), function (data) {
                    if (data.status == 1) {
                        $("tr[id=" + taskId + "]").remove();
                    }
                });
            }
        });
    }

    //提交更改分享任务按钮
    $("#changeShareTaskPost").click(function () {
        var titleVal = $("#changeShareTitle").val();
        var descriptionVal = $("#changeShareDescription").val();
        var newTagOne = $("#changeShareTagOne").val(),
            newTagTwo = $("#changeShareTagTwo").val(),
            newTagThree = $("#changeShareTagThree").val();
        if (titleVal == "" || descriptionVal == "" || (newTagOne == "" && newTagTwo == "" && newTagThree == "")) {
            alert("请填写完全");
            return false;
        }
        $.post("/changeShareTaskById/" + taskId + "?time=" + new Date().getTime(), {username: $("#changeShareAuthor").val(), title: titleVal, description: descriptionVal, tag_one: newTagOne, tag_two: newTagTwo, tag_three: newTagThree  }, function (data) {
            if (data.status == 1) {
                $("#changeShareTaskClose").click();
                getShareTasks(thisPage);
            }
        });
    });


    //获得分享任务详细信息
    function doButton() {
        $("[id^=intShareTask-]").click(function () {
            $("#newTitle").val("");
            $("#newStartDate").val("");
            $("#newDescription").val("");
            $("#newTagOne").val("");
            $("#newTagTwo").val("");
            $("#newTagThree").val("");
            $("#newBox").val(0);
            $("#newPriority").val(0);
            $("#start-date-time").hide();
            $("#start-date").show();
            taskId = $(this).val();
            $.getJSON("/getShareTaskById/" + $(this).val() + "?time=" + new Date().getTime(), function (data) {
                var task = eval(data);
                $("#newTitle").val(task.title);
                $("#newDescription").val(task.description);
                $("#newTagOne").val(task.tags[0]);
                $("#newTagTwo").val(task.tags[1]);
                $("#newTagThree").val(task.tags[2]);
            });
        });
    }

    //添加任务
    $("#addTaskPost").click(function () {
        var titleVal = $("#newTitle").val();
        var startDateVal = moment($("#newStartDate").val(), "YYYY-MM-DD").format("YYYY-MM-DD ZZ");
        var startDateTimeVal = moment($("#newStartDateTime").val(), "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm ZZ");
        var descriptionVal = $("#newDescription").val();
        var newTagOne = $("#newTagOne").val(),
            newTagTwo = $("#newTagTwo").val(),
            newTagThree = $("#newTagThree").val();
        if (titleVal == "" || (startDateVal == "" && startDateTimeVal == "") || descriptionVal == "" || (newTagOne == "" && newTagTwo == "" && newTagThree == "")) {
            alert("请填写完全");
            return false;
        }

        $.post("/addTask" + "?time=" + new Date().getTime(), {title: titleVal, start_date: startDateVal, start_date_time: startDateTimeVal, checkbox_date: checkboxDateVal, description: descriptionVal, box: $("#newBox").val(), priority: $("#newPriority").val(), tag_one: newTagOne, tag_two: newTagTwo, tag_three: newTagThree  }, function (data) {
            if (data.status == 1) {
                $("#addTaskClose").click();
            }
        });
    });

    //获得总页数
    function getPageCount() {
        showLoading();
        $.getJSON("/getShareTasksSumPage" + "?time=" + new Date().getTime(), function (result) {
            if (result.count == 1 || result.count == 0) {
                $('#pagination').empty();
                if (result.count == 1) {
                    $("#shareTaskTbody").empty();
                    getShareTasks(1);
                } else {
                    $("#shareTaskTbody").empty();
                    hideLoading();
                }
            } else {
                getShareTasks(1);
                pagination(result.count);
            }
        });
    }

    //初始化分页导航
    function pagination(pageCount) {
        console.log(pageCount);
        //分页参数
        var options = {
            bootstrapMajorVersion: 3,
            currentPage: 1,
            totalPages: pageCount,
            onPageClicked: function (e, originalEvent, type, page) {
                thisPage = page;
                getShareTasks(page);
            }
        };
        $('#pagination').bootstrapPaginator(options);
    }

    function getShareTasks(page) {
        $("#shareTaskTbody").empty();
        showLoading();
        var username;
        $.getJSON("/getUserByUsername" + "?time=" + new Date().getTime(), function (data) {
            username = data.username;
        });
        $.getJSON("/getShareTasksByPageCount/Page/" + page + "?time=" + new Date().getTime(), function (data) {
            $.each(data, function (idx, item) {
                var create_task_date = moment(item.create_task_date).format('YYYY-MM-DD');
                if (username == item.username) {
                    $("#shareTaskTbody").append("<tr id='" + item._id + "'><td>" + item.username + "</td><td>" + item.title + "</td><td>" + item.description + "</td><td><label class='label label-info'>" + item.tags[0] + "</label> <label class='label label-info'>" + item.tags[1] + "</label> <label class='label label-info'>" + item.tags[2] + "</label></td><td>" + create_task_date + "</td><td><button id='intChangeShareTask-" + item._id + "' data-toggle='modal' data-target='#ChangeShareTask' class='btn btn-info btn-sm' value='" + item._id + "'>更改</button>&nbsp;<button id='deleteShareTask-" + item._id + "' class='btn btn-danger btn-sm' value='" + item._id + "'>删除</button></td><td><button id='intShareTask-" + item._id + "' data-toggle='modal' data-target='#DoIt' title='将此任务添加到您的任务列表？' class='btn btn-primary btn-sm' value='" + item._id + "'>Yes! I Do It!</button></td></tr>");
                } else {
                    $("#shareTaskTbody").append("<tr id='" + item._id + "'><td>" + item.username + "</td><td>" + item.title + "</td><td>" + item.description + "</td><td><label class='label label-info'>" + item.tags[0] + "</label> <label class='label label-info'>" + item.tags[1] + "</label> <label class='label label-info'>" + item.tags[2] + "</label></td><td>" + create_task_date + "</td><td></td><td><button id='intShareTask-" + item._id + "' data-toggle='modal' data-target='#DoIt' title='将此任务添加到您的任务列表？' class='btn btn-primary btn-sm' value='" + item._id + "'>Yes! I Do It!</button></td></tr>");
                }

            });
            //初始化更改任务窗口
            hideLoading();
            doButton();
            changeButton();
            deleteButton();
        });
    }

    $('.form_date').datetimepicker({
        minDate: moment().subtract('days', 1),
        showToday: true,
        language: 'zh-CN',
        pickTime: false,
        autoclose: 1
    });

    $('.form_date_time').datetimepicker({
        minDate: moment().subtract('days', 1),
        showToday: true,
        language: 'zh-CN',
        autoclose: 1
    });

    $("[name='isStartTime']").bootstrapSwitch('size', 'small');

    $("#startTime-checkbox").on('switchChange.bootstrapSwitch', function (event, state) {
        checkboxDateVal = state.value;
        if (state.value == true) {
            $("#start-date").hide();
            $("#newStartDate").val("");
            $("#start-date-time").show();
        }
        else {
            $("#start-date").show();
            $("#newStartDateTime").val("");
            $("#start-date-time").hide();
        }

    });

    function showLoading(){
        $("#loading").show();
    }

    function hideLoading(){
        $("#loading").hide();
    }

});
