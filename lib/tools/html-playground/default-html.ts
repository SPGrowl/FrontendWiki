export const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      padding: 1rem;
    }
    .box {
      width: 96px;
      height: 96px;
      border-radius: 12px;
      background: tomato;
      transition: transform 0.3s, background 0.3s;
    }
    .box:hover { transform: scale(1.08); }
    @media (max-width: 480px) {
      .box { background: dodgerblue; }
    }
  </style>
</head>
<body>
  <div class="box" id="box"></div>
  <p>点击色块；拖窄右侧预览可看到 480px 媒体查询。</p>
  <script>
    document.getElementById("box").addEventListener("click", () => {
      alert("clicked");
    });
  </script>
</body>
</html>
`;
