## 项目简介

## 项目启动

```bash
# 安装 pnpm
npm install pnpm -g

# 安装依赖
pnpm install

# 启动运行
pnpm run dev
```


## 项目部署

```bash
# 项目打包
pnpm run build

# 上传文件至远程服务器
将打包生成在 `dist` 目录下的文件拷贝至 `/usr/share/nginx/html` 目录

# nginx.cofig 配置
server {
	listen     80;
	server_name  localhost;
	location / {
			root /usr/share/nginx/html;
			index index.html index.htm;
	}
	# 反向代理配置
	location /prod-api/ {
            # vapi.youlai.tech 替换后端API地址，注意保留后面的斜杠 /
            proxy_pass http://vapi.youlai.tech/; 
	}
}
```

## 注意事项

- **自动导入插件自动生成默认关闭**

  模板项目的组件类型声明已自动生成。如果添加和使用新的组件，请按照图示方法开启自动生成。在自动生成完成后，记得将其设置为 `false`，避免重复执行引发冲突。

  ![](https://foruda.gitee.com/images/1687755823137387608/412ea803_716974.png)
