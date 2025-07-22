#!/bin/bash

# 服务器初始化脚本
set -e

echo "🚀 开始初始化服务器..."

# 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装Docker
echo "🐳 安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# 安装Docker Compose
echo "📋 安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 安装其他必要工具
echo "🔧 安装必要工具..."
sudo apt install -y curl wget git htop nginx certbot python3-certbot-nginx

# 创建应用目录
echo "📁 创建应用目录..."
sudo mkdir -p /opt/goodman-forum
sudo chown $USER:$USER /opt/goodman-forp-forum

# 配置防火墙
echo "🔥 配置防火墙..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 配置Nginx（可选）
echo "🌐 配置Nginx..."
sudo tee /etc/nginx/sites-available/goodman-forum << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/goodman-forum /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 配置SSL证书（可选）
echo "🔒 配置SSL证书..."
# sudo certbot --nginx -d your-domain.com

# 创建定时备份脚本
echo "💾 创建备份脚本..."
sudo tee /opt/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# 备份数据库
docker-compose exec -T postgres pg_dump -U postgres goodman_forum > $BACKUP_DIR/db_$DATE.sql

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /opt/goodman-forum uploads/

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /opt/backup.sh

# 配置定时任务
echo "⏰ 配置定时备份..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -

echo "✅ 服务器初始化完成！"
echo "📝 下一步："
echo "1. 将项目文件复制到 /opt/goodman-forum"
echo "2. 配置 .env 文件"
echo "3. 运行 ./deploy.sh 部署应用" 