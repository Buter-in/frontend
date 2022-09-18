.PHONY: clean
run:
	docker run \
	--rm \
	--name buterin_frontend \
	-v ${PWD}:/frontend \
	-p 80:3000 \
	-ti node:16 sh \
	-c 'cd /frontend && npm install && npm run start'