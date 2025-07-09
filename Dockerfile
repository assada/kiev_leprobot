FROM node:18-alpine

RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg \
    python3 \
    make \
    g++ \
    pkgconfig \
    fontconfig \
    ttf-dejavu \
    ttf-droid \
    ttf-freefont \
    ttf-liberation

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["npm", "start"] 