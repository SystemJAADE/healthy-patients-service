build:
	yarn run build
	
install-dev:
	yarn install --immutable --immutable-cache --check-cache

install-prod:
	yarn install --production --frozen-lockfile && yarn cache clean

run-dev:
	./bin/start-dev.sh

run-prod:
	./bin/start-prod.sh