# aws-lambda-ec2-start-stop

## 前準備

Lambda用のロールにアタッチするポリシーの例

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt0000000000001",
            "Effect": "Allow",
            "Action": [
                "ec2:describe*",
                "ec2:StartInstances",
                "ec2:StopInstances"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "arn:aws:logs:ap-northeast-1:XXXXXXXXXXXX:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "arn:aws:logs:ap-northeast-1:XXXXXXXXXXXX:log-group:/aws/lambda/ec2-start-stop:*"
            ]
        }
    ]
}
```

## EC2タグ設定

| 必須  | タグ名   | 例     | 備考|
| :--: |---------| ------ | -------|
| x | Type        | dev   | dev以外は対象外 |
|   | Start       | 10:00 | 起動時間 (JST) |
|   | End         | 19:00 | 停止時間 (JST) |
|   | BusinessDay | 1-5   | 起動する曜日<br>月曜から金曜: 1-5<br>月水金: 1,3,5<br>火曜日のみ: 2<br>未設定の場合は毎日起動|
|   | Name        | hoge  | インスタンス名（設定しなくてもOK） |


## Lambda function 反映

```
$ npm run buld
```

上記コマンドで作成した、ec2-start-stop.zip をLambdaのfunctionにアップロード


## 参照

[OpsWorksかLambda(スケジュール）を使ってEC2自動起動自動停止で費用節約する)](http://qiita.com/toshihirock/items/83c15c35562bed170fe4)

