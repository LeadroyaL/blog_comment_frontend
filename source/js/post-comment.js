var ob = null;
var alreadyComment = false;

function enable_ob(path, post_id) {
    ob = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.target == ob.ele && entry.isIntersecting) {
                fetch_comments(ob.path, post_id);
            }
        });
    });
    ob.path = path;
    ob.ele = document.getElementById("post-comment-loading");
    ob.observe(ob.ele);
}

function fetch_comments(path, post_id) {
    // path unused
    ob.unobserve(ob.ele);
    ob.disconnect();
    const url = "https://flask-ioz-wzeivghcie.cn-hangzhou.fcapp.run/get/" + post_id;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                document.getElementById("post-comment-loading").style.display = 'none';
                try {
                    comments = JSON.parse(xmlhttp.responseText);
                    render_comments(comments);
                } catch (e) {
                    alert(`无法解析json，返回内容是 ${xmlhttp.responseText}`);
                }
            } else {
                alert("评论加载失败，如频繁出现请联系管理员");
            }
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function render_comments(comments) {
    let comment_div = document.getElementsByClassName("post-comment")[0];
    if (comments.length == 0) {
        let p = document.createElement("p");
        p.innerText = "目前还没有人评论呢";
        comment_div.appendChild(p);
    } else {
        let p = document.createElement("p");
        p.innerText = comments.length + "条评论";
        comment_div.appendChild(p);
    }
    comments.forEach(comment => {
        let author = comment.author;
        let time = comment.time;
        let content = comment.content;
        comment_div.appendChild(comment_to_ele(author, time, content));
    });
}

function comment_to_ele(author, time, content) {
    let div = document.createElement("div");
    div.className = "post-comment-item";
    let p_author_time = document.createElement("h3");
    p_author_time.textContent = '用户 ' + author + ' 发表于 ' + time;
    let p_content = document.createElement("p");
    p_content.textContent = content;
    div.appendChild(p_author_time);
    div.appendChild(p_content);
    return div;
}

function new_post(path, post_id) {
    // path unused
    if (alreadyComment) {
        alert("您已经评论过一次了，为了避免重复提交，请刷新页面后重试");
        return;
    }
    let author = document.getElementById("new-post-author").value;
    let email = document.getElementById("new-post-email").value;
    let content = document.getElementById("new-post-content").value;
    if (author.length == 0 || email.length == 0) {
        alert("昵称/邮箱禁止为空");
        return;
    }
    if (content.length == 0) {
        alert("评论内容为空");
        return;
    }
    const url = "https://flask-ioz-wzeivghcie.cn-hangzhou.fcapp.run/put/" + post_id;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                alert("评论提交成功，请耐心等待审核");
                alreadyComment = true;
            } else {
                alert("评论提交失败，可能代码写抽了，请联系管理员");
            }
        }
    };
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify({
        "author": author,
        "email": email,
        "content": content
    }));
}